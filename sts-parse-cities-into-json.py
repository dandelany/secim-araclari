#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import bs4
import urllib2
import time
import json
from pprint import pprint as pprint

BB, ILCE, MECLIS = range(1,4)

headers = [
            # "il",
            # "ilce",
            # "sandik",
            # "alan",

            # registered voters 
            "kayitli_secmen",
            # registered voters who voted
            "oy_kullanan_kayitli_secmen",
            # voters as required by law? provisional ballots/proxy votes?
            "kanun_geregi_oy_kullanan",
            # total votes cast
            "kullanilan_toplam_oy",

            "itirazsiz_gecerli_oy",
            "itirazli_gecerli_oy",
            "gecerli_oy",
            # invalid votes
            "gecersiz_oy",
          ]

def fetch_and_parse(url, get_headers=False):
    html = bs4.BeautifulSoup(urllib2.urlopen(url, "r").read())
    row = []
    row = {'chp_url': url}

    # city, state, ballot box
    il_ce_san = html.find("span", attrs={"id":"TabContainer_TabPanel1_lblOzetIlIlce1"}).getText().replace(" ", "").split("/")
    alan = html.find("span", attrs={"id":"TabContainer_TabPanel1_lblOzetSandikAlani1"}).getText()
    row.update({'il': il_ce_san[0], 'ilce': il_ce_san[1], 'sandik': il_ce_san[2], 'alan': alan})

    # NOTE: Now for BB
    row.update(dict(zip(headers, [v.get("value", "0") for v in html.findAll("input", attrs={"class" : "chp-info-field"})[:8]])))

    # List of all vote results for BB
    votes = [v for v in html.findAll("div", attrs={"class" : "chp-vote-row", "id" : None})\
                     if "TabPanel1_rptPartiler" in v.input.get("id", "")]
    for vote in votes:
        # Get the name from the logo url (easiest)
        name = "%s_oy" % (os.path.basename(vote.img["src"]).split(".")[0])
        vote_count = vote.input.get("value", "0")
        row.update(dict([[name, vote_count]]))

    return row

if __name__ == "__main__":
    if not os.path.exists("data"): 
        os.makedirs("data")
    if not os.path.exists("data/city_results"): 
        os.makedirs("data/city_results")

    for url_file in os.listdir("data/query_urls"):
        print url_file[0:-4]
        list_of_urls = open("data/query_urls/" + url_file, "r").read().split("\n")
        vote_data = [];
        i = 1
        total = len(list_of_urls) + 1

        for url in list_of_urls:
            print "[%3d / %5d] %s" % (i, total, url)
            i += 1
            box_data = fetch_and_parse(url)
            print ', '.join([box_data['il'], box_data['ilce'], box_data['alan'], box_data['sandik']])
            vote_data.append(box_data)
            
            #time.sleep(0.5)
            if(i % 10 == 0):
                # only write to file every 10th time to save overhead time
                json_file = open("data/city_results/" + url_file[0:-4] + ".json", "w")
                json_file.write(json.dumps(vote_data, indent=4))
                json_file.close()

    json_file = open("data/city_results/" + url_file[0:-4] + ".json", "w")
    json_file.write(json.dumps(vote_data, indent=4))
    json_file.close()


