import json

JSON_FILE = "/Users/anaghajay/Desktop/cpln692/Datasets/ufo.geojson"

with open(JSON_FILE) as json_:
	data = json.load(json_)
	features_list = data["features"]
	print len(features_list),type(features_list)
	for each_feature in features_list:
		properties = each_feature["properties"]
		lat = properties["latitude"]
		long = properties["longitude"]
		if type(lat) != float or type(long) != float:
			print properties 	

