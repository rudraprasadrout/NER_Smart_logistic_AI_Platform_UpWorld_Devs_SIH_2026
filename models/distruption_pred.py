import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.metrics import root_mean_squared_error, r2_score
import joblib

# 1. Load the dataset
df = pd.read_csv("data/historical_disruptions.csv")

# 2. Define features
numeric_features = [
    'rainfall_24h_mm',
    'slope_deg',
    'soil_saturation',
    'base_vulnerability',
    'active_reports_count'
]
categorical_features = ['district']

X = df[numeric_features + categorical_features]
y = df['disruption_level']

# 3. Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Create the preprocessing rules
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        # handle_unknown='ignore' prevents crashes if a new district appears in production
        ('cat', OneHotEncoder(drop='first', handle_unknown='ignore'), categorical_features)
    ]
)

# 5. Build the pipeline (Preprocessor + Model)
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', LinearRegression())
])

# 6. Train the pipeline
pipeline.fit(X_train, y_train)

# 7. Evaluate to confirm accuracy
y_pred = pipeline.predict(X_test)
print(f"R-squared: {r2_score(y_test, y_pred):.4f}")
print(f"RMSE: {root_mean_squared_error(y_test, y_pred):.4f}")

# 8. Export the trained pipeline to a .pkl file
joblib.dump(pipeline, 'models/disruption_model.pkl')
