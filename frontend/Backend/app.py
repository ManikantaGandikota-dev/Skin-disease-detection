from flask import Flask, request, jsonify
import os
import base64
import cv2
from torchvision import transforms
import numpy as np
import torch
from ultralytics import YOLO
from flask_cors import CORS
from PIL import Image
import torch
#from Cnn_yolo import cnn_model, yolo_model

from tensorflow.keras.models import load_model

import torch.nn as nn
from torchvision import models

class SkinMultiTaskModel(nn.Module):
    def __init__(self):
        super(SkinMultiTaskModel, self).__init__()
        # Load backbone
        self.backbone = models.efficientnet_b0(pretrained=True)
        num_ftrs = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Identity() # Remove default head

        # Task-specific heads (Binary outputs for each)
        self.heads = nn.ModuleDict({
            'acne': nn.Linear(num_ftrs, 1),
            'pores': nn.Linear(num_ftrs, 1),
            'wrinkles': nn.Linear(num_ftrs, 1),
            'blackheades': nn.Linear(num_ftrs, 1),
            'dark spots': nn.Linear(num_ftrs, 1)
        })

    def forward(self, x):
        features = self.backbone(x)
        return {task: head(features) for task, head in self.heads.items()}

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(BASE_DIR)

CNN_MODEL_PATH = os.path.join(BASE_DIR, "Models", "skin_model_leakage_free.pth")

cnn_model = SkinMultiTaskModel()


cnn_model.load_state_dict(
    torch.load(CNN_MODEL_PATH, map_location=DEVICE)
)

cnn_model.to(DEVICE)
cnn_model.eval()

print("CNN model loaded successfully")
cnn_model.eval()

print("CNN model loaded successfully")


YOLO_MODEL_PATH = os.path.join(BASE_DIR, "Models", "Skin_Makeup_yolo.pt")

yolo_model = YOLO(YOLO_MODEL_PATH)
print("YOLO model loaded successfully")

CATEGORIES = ['acne', 'pores', 'wrinkles', 'blackheades', 'dark spots']

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True
    )


print("Models loaded successfully")

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------- YOLO Prediction ----------
@app.route("/predict-yolo", methods=["POST"])
def predict_yolo():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    file = request.files["image"]
    # filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    # file.save(filepath)

    file_bytes = file.read()
    img_array = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    results = yolo_model(img)

    image_bgr = img.copy()
    predictions = []


    for box in results[0].boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        class_name = yolo_model.names[class_id]
        label = f"{class_name} ({confidence:.2f})"


        # draw bounding box
        cv2.rectangle(image_bgr, (x1, y1), (x2, y2), (0, 255, 0), 2)

        cv2.putText(
            image_bgr,
            label,
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )

        predictions.append({
            "class": class_name,
            "confidence": round(confidence, 2),
            "bbox": [x1, y1, x2, y2]
        })


    _, buffer = cv2.imencode(".jpg", image_bgr)
    img_base64 = base64.b64encode(buffer).decode("utf-8")

    return jsonify({
        "image": img_base64,
        "predictions": predictions
    })


transform = transforms.Compose([
    transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

def process_prediction(image_path):
    """Core logic to process image and return predictions."""
    img = Image.open(image_path).convert('RGB')
    img_t = transform(img).unsqueeze(0).to(DEVICE)
    
    results = {}
    with torch.no_grad():
        outputs = cnn_model(img_t)
        for cat in CATEGORIES:
            # Sigmoid for multi-head binary classification
            prob = torch.sigmoid(outputs[cat]).item()
            results[cat] = prob
            
    sorted_results = sorted(results.items(), key=lambda x: x[1], reverse=True)

    # convert to clean JSON format
    formatted = [
        {"label": cat, "confidence": round(score * 100, 2)}
        for cat, score in sorted_results[:3]
    ]

    return formatted


@app.route("/predict-cnn", methods=["POST"])
def predict_skin_texture():

    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['image']
    temp_path = "temp_image.jpg"
    file.save(temp_path)

    try:
        predictions = process_prediction(temp_path)
        top_label, top_score = predictions[0]

        return jsonify({
            "prediction": predictions[0]["label"],
            "top3": predictions,
            "top_confidence": f"{predictions[0]['confidence']:.2f}%"      })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    app.run(debug=True)
    