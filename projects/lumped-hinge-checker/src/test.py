def transform_data(input_data):
    # Extract the keys from the "IEHP" dictionary
    keys = input_data["IEHP"].keys()
    
    # Create the desired output format
    rows = [{"id": int(key), "name": ""} for key in keys]
    
    return {"rows": rows}

# Example input
input_data = {
    "IEHP": {
        "1": {},
        "2": {},
        "3": {},
        "4": {}
    }
}

# Transform the data
output_data = transform_data(input_data)

# Print the output
print(output_data)