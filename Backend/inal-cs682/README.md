Written entirely by Inal Mashukov for CS 682.
<!-- project tree (including 3 models) -->
use Model 1 (best performance)

cs682/
├── config
│   └── config.json
├── data
│   ├── features.csv
│   └── targets.csv
├── evaluate.py
├── experiments
|   |
│   ├── model-1
│   │   ├── assets
│   │   ├── keras_metadata.pb
│   │   ├── saved_model.pb
│   │   └── variables
│   │       ├── variables.data-00000-of-00001
│   │       └── variables.index
│   ├── model-2
│   │   ├── assets
│   │   ├── keras_metadata.pb
│   │   ├── saved_model.pb
│   │   └── variables
│   │       ├── variables.data-00000-of-00001
│   │       └── variables.index
│   ├── model-3
│   │   ├── assets
│   │   ├── keras_metadata.pb
│   │   ├── saved_model.pb
│   │   └── variables
│   │       ├── variables.data-00000-of-00001
│   │       └── variables.index
|   |
│   ├── training_logs-2.txt
│   └── training_logs.txt
├── README.md
├── requirements.txt
├── src
│   ├── models
│   │   └── model.py
│   └── utils
│       └── data_loader.py
└── train.py