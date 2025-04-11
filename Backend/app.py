from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables frontend access to this API

#Replace this with your actual RapidAPI key
RAPIDAPI_KEY = "879275a2b6mshf4b3de1300b03aep10b3edjsn456c19e64bda"
RAPIDAPI_HOST = "realty-in-us.p.rapidapi.com"

@app.route('/property-info', methods=['GET'])
def get_property_info():
    address = request.args.get('address')
    print("🔍 Address received:", address)

    if not address:
        return jsonify({"error": "Address is required"}), 400

    # Detect if it's a ZIP code
    is_zip = address.isdigit()

    params = {
        "limit": 1,
        "offset": 0,
        "sort": "newest",
        "postal_code": address if is_zip else None,
        "city": None if is_zip else address
    }

    params = {k: v for k, v in params.items() if v}  # remove None values

    url = "https://realty-in-us.p.rapidapi.com/properties/v3/list"
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        print("Realty API response code:", response.status_code)
        data = response.json()
        print("Response preview:", data.get("data"))

        results = data.get("data", {}).get("home_search", {}).get("results", [])
        if not results:
            return jsonify({"error": "No property found"}), 404

        return jsonify(results[0])  # return first result
    except Exception as e:
        print("Exception:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)