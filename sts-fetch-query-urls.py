#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import sys
import bs4
import urllib2
import time
import os

VIEWSTATE = None

def get_viewstate(url=None, html=None):
    if url:
        _html = bs4.BeautifulSoup(urllib2.urlopen(url).read())
    else:
        _html = html

    return _html.find("input", attrs={"id" : "__VIEWSTATE"}).get("value")

def get_states(city):
    """Get POST parameters for getting states."""

    global VIEWSTATE
    VIEWSTATE = get_viewstate(url="http://sts.chp.org.tr")

    params =  {
                "__LASTFOCUS"       : "",
                "__VIEWSTATE"       : VIEWSTATE,
                "__EVENTTARGET"     : "drpIller",
                "__EVENTARGUMENT"   : "",
                "txtTckn"           : "",
                "drpIller"          : city,
              }

    states = {}
    r = requests.post("http://sts.chp.org.tr/", params)
    html = bs4.BeautifulSoup(r.text)
    for st in html.find("select", attrs={"id" : "drpIlceler"}).findAll("option")[1:]:
        states[st.getText().strip()] = st.get("value")

    VIEWSTATE = get_viewstate(html=html)

    return states

def get_boxes(city, state):
    """Get POST parameters for ballot boxes using state info."""

    params = {
                "__LASTFOCUS"       : "",
                "__VIEWSTATE"       : VIEWSTATE,
                "__EVENTTARGET"     : "drpIlceler",
                "__EVENTARGUMENT"   : "",
                "txtTckn"           : "",
                "drpIller"          : city,
                "drpIlceler"        : state,
             }

    url_pattern = "http://sts.chp.org.tr/SonucDetay.aspx?sid="

    r = requests.post("http://sts.chp.org.tr/", params)
    time.sleep(0.5)
    html = bs4.BeautifulSoup(r.text)
    urls = []

    for sid in html.find("select", attrs={"id" : "drpSandiklar"}).findAll("option")[1:]:
        urls.append("http://sts.chp.org.tr/SonucDetay.aspx?sid=" + sid.get("value"))

    return urls

if __name__ == "__main__":
    # List of cities
    cities = [
     u'ADANA',
     u'ADIYAMAN',
     u'AFYONKARAH\u0130SAR',
     u'A\u011eRI',
     u'AMASYA',
     u'ANKARA',
     u'ANTALYA',
     u'ARTV\u0130N',
     u'AYDIN',
     u'BALIKES\u0130R',
     u'B\u0130LEC\u0130K',
     u'B\u0130NG\xd6L',
     u'B\u0130TL\u0130S',
     u'BOLU',
     u'BURDUR',
     u'BURSA',
     u'\xc7ANAKKALE',
     u'\xc7ANKIRI',
     u'\xc7ORUM',
     u'DEN\u0130ZL\u0130',
     u'D\u0130YARBAKIR',
     u'ED\u0130RNE',
     u'ELAZI\u011e',
     u'ERZ\u0130NCAN',
     u'ERZURUM',
     u'ESK\u0130\u015eEH\u0130R',
     u'GAZ\u0130ANTEP',
     u'G\u0130RESUN',
     u'G\xdcM\xdc\u015eHANE',
     u'HAKKAR\u0130',
     u'HATAY',
     u'ISPARTA',
     u'MERS\u0130N',
     u'\u0130STANBUL',
     u'\u0130ZM\u0130R',
     u'KARS',
     u'KASTAMONU',
     u'KAYSER\u0130',
     u'KIRKLAREL\u0130',
     u'KIR\u015eEH\u0130R',
     u'KOCAEL\u0130',
     u'KONYA',
     u'K\xdcTAHYA',
     u'MALATYA',
     u'MAN\u0130SA',
     u'KAHRAMANMARA\u015e',
     u'MARD\u0130N',
     u'MU\u011eLA',
     u'MU\u015e',
     u'NEV\u015eEH\u0130R',
     u'N\u0130\u011eDE',
     u'ORDU',
     u'R\u0130ZE',
     u'SAKARYA',
     u'SAMSUN',
     u'S\u0130\u0130RT',
     u'S\u0130NOP',
     u'S\u0130VAS',
     u'TEK\u0130RDA\u011e',
     u'TOKAT',
     u'TRABZON',
     u'TUNCEL\u0130',
     u'\u015eANLIURFA',
     u'U\u015eAK',
     u'VAN',
     u'YOZGAT',
     u'ZONGULDAK',
     u'AKSARAY',
     u'BAYBURT',
     u'KARAMAN',
     u'KIRIKKALE',
     u'BATMAN',
     u'\u015eIRNAK',
     u'BARTIN',
     u'ARDAHAN',
     u'I\u011eDIR',
     u'YALOVA',
     u'KARAB\xdcK',
     u'K\u0130L\u0130S',
     u'OSMAN\u0130YE',
     u'D\xdcZCE']

    # Select cities
    my_cities = []
    cities_arg = sys.argv[1].decode("utf-8")
    city_strs = cities if cities_arg == "--all" else cities_arg.split(",")

    if not os.path.exists("data"): 
        os.makedirs("data")
    if not os.path.exists("data/query_urls"): 
        os.makedirs("data/query_urls")

    for city_str in city_strs:
        try:
            city = cities.index(city_str) + 1
            my_cities.append(city)
        except IndexError, e:
            print "Usage: %s <city_name (e.g. İSTANBUL)> [state_name (e.g. KADIKÖY)]" % sys.argv[0]
            sys.exit(1)

        print city_str
        # Get states of this city
        state_dict = get_states(city)

        if len(sys.argv) > 2:
            # State is specified
            state_name = sys.argv[2].decode("utf-8")
            states = [state_dict[state_name]]
            output = cities[city-1] + "_" + state_name + ".txt"
        else:
            # All of them
            states = state_dict.values()
            output = cities[city-1] + ".txt"

        boxes = []
        for state in states:
            print state
            boxes.extend(get_boxes(city, state))

        open("data/query_urls/" + output, "w").write("\n".join(boxes))

        if len(cities) > 2:
            time.sleep(5)
