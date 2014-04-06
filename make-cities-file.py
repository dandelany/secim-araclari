#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import time

if __name__ == "__main__":
    while True:
        cities = []

        for results_file in os.listdir("data/city_results"):
            cities.append(results_file[0:-5].decode('utf-8'))

        print json.dumps(cities)
        cities_json = open('data/cities.json','w')
        cities_json.write(json.dumps(cities))
        cities_json.close()

        time.sleep(60)
