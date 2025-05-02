# Written by Inal Mashukov
# for CS 682
# University of Massachusetts Boston

import tensorflow as tf 
from tensorflow import keras 
from src.models.model import PricePredictionModel 
from src.utils.data_loader import load_data
import json


def main():
    # List available GPUs
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if len(gpus) > 0:
        # memory safety stuff (releases memory if the program crashes, or at least doesn't preallocate and occupy more than needed):
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)

        # Set the specific GPU (e.g., GPU 0, in my case 3)
        tf.config.set_visible_devices(gpus[3], 'GPU')

        print("Using GPU:", gpus[3].name)
    else:
        print("No GPU available, using CPU.")

    # Paths 
    features_path = "./data/features.csv"
    targets_path = "./data/targets.csv"

    # Load config
    with open("./config/config.json", "r") as file:
        config = json.load(file)

    # Load data
    X_train, X_val, X_test, y_train, y_val, y_test = load_data(features_path, targets_path)

    # Get model hyperparameters 
    model_config = config["model"]
    train_config = config["train"]

    # Initialize model
    model = PricePredictionModel(**model_config)

    # Compile model
    optimizer = keras.optimizers.Adam(learning_rate=train_config["learning_rate"])
    model.compile(optimizer=optimizer, loss="mse", metrics=["mae"])

    # Callbacks
    lr_scheduler = keras.callbacks.ReduceLROnPlateau(
        monitor="mae",
        factor=0.1, 
        patience=train_config["lr_patience"], 
        min_lr=1.e-9
    )

    early_stopping = keras.callbacks.EarlyStopping(
        monitor="val_loss", 
        patience=train_config["early_stopping_patience"],
        restore_best_weights=True
    )

    # Log the training output
    log_file_path = "./experiments/training_logs-n.txt"
    log_file = open(log_file_path, "w")

    # Write hyperparameters to the log file
    log_file.write("******************* HYPERPARAMETERS **********************\n")
    log_file.write(f"Model configuration:\n{model_config}\n")
    log_file.write(f"Training configuration:\n{train_config}\n")
    log_file.write("**********************************************************\n\n")

    # Save logs to the file
    class LogToFileCallback(keras.callbacks.Callback):
        def on_epoch_end(self, epoch, logs=None):
            logs = logs or {}
            log_file.write(f"Epoch {epoch+1}/{self.params['epochs']}\n")
            for key, value in logs.items():
                log_file.write(f"{key}: {value}\n")
            log_file.write("\n")

    # Initialize custom callback
    log_to_file = LogToFileCallback()

    # Train the model
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=train_config["epochs"],
        batch_size=train_config["batch_size"],
        callbacks=[lr_scheduler, early_stopping, log_to_file]
    )

    # Close the log file after training
    log_file.close()

    # Evaluation
    test_loss, test_mae = model.evaluate(X_test, y_test)
    print(f"Test loss: {test_loss:.4f}, Test MAE: {test_mae:.4f}")

    # Save the model
    model.save("./experiments/model-n", save_format="tf")


if __name__ == "__main__":
    main()
