#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import bs4
import urllib2
import time

BB, ILCE, MECLIS = range(1,4)

headers = [
            "il",
            "ilce",
            "sandik",
            "alan",
            "kayitli_secmen",
            "oy_kullanan_kayitli_secmen",
            "kanun_geregi_oy_kullanan",
            "kullanilan_toplam_oy",
            "itirazsiz_gecerli_oy",
            "itirazli_gecerli_oy",
            "gecerli_oy",
            "gecersiz_oy",
          ]

def fetch_and_parse(url, get_headers=False):
    html = bs4.BeautifulSoup(urllib2.urlopen(url, "r").read())
    row = []

    row.extend(html.find("span", attrs={"id":"TabContainer_TabPanel1_lblOzetIlIlce1"}).getText().replace(" ", "").split("/"))
    row.append(html.find("span", attrs={"id":"TabContainer_TabPanel1_lblOzetSandikAlani1"}).getText())
    # NOTE: Now for BB
    row.extend([v.get("value", "0") for v in html.findAll("input", attrs={"class" : "chp-info-field"})[:8]])

    # List of all vote results for BB
    votes = [v for v in html.findAll("div", attrs={"class" : "chp-vote-row", "id" : None})\
                     if "TabPanel1_rptPartiler" in v.input.get("id", "")]
    for vote in votes:
        # Get the name from the logo url (easiest)
        name = "%s_oy" % (os.path.basename(vote.img["src"]).split(".")[0])
        vote_count = vote.input.get("value", "0")
        row.append(vote_count)
        if get_headers:
            headers.append(name)

    return ",".join(row).encode("utf-8")

if __name__ == "__main__":
    if not os.path.exists("data"): 
        os.makedirs("data")
    if not os.path.exists("data/city_results"): 
        os.makedirs("data/city_results")

    for url_file in os.listdir("data/query_urls"):
        print url_file[0:-4]
        with open("data/city_results/" + url_file[0:-4] + ".csv", "w") as csv:
            list_of_urls = open("data/query_urls/" + url_file, "r").read().split("\n")
            # Parse the first one to fetch columns
            first = list_of_urls.pop(0)
            row = fetch_and_parse(first, True)

            csv.write(",".join(headers).encode('utf-8') + "\n")
            csv.write(row + "\n")

            i = 2
            total = len(list_of_urls) + 1

            for url in list_of_urls:
                print "[%3d / %5d] %s" % (i, total, url)
                i += 1
                csv.write(fetch_and_parse(url) + "\n")
                #time.sleep(0.5)
