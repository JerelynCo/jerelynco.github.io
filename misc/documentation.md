Project Specifications:
	Data where she scraped from: http://mmdatraffic.interaksyon.com/line-view-commonwealth.php
	Data scraped: http://penoy.admu.edu.ph/~reina/
	Uname: reina
	PW: qu33n
	You can download the data scraped through the use of wget. 
	wget: wget -r --no-parent --reject=index.html --user=reina --password=qu33n http://penoy.admu.edu.ph/~reina/

	Package: Beautiful soup package
		Save in the same folder where your script is.
		The script extracts the html file from the URL provided, then beautiful soup parses the html file by locating the HTML/CSS tags.

	CSV format:
	year, month, day, hourr, qtr, lineID, stationID, statusN, statusS
	2014, 7-12, 1-31, 0-24, 1-4, 0-8, 0-nStations, 0-2, 0-2

	In Project/input/output folder:
		Parse each of the csv files in the output folder:
			0. Attach if weekend or weekday
				Data collection started last July 25, 2014 which is a friday.
			1. Match the following columns:
				hour, qtr, lineID, StationID
				Note: Only for lineID 0 and Station ID from 0-36 (EDSA)
			2. Get the average statuses for both StatusN and StatusS with its corresponding values in 1.

Opening webserver:
	python -m SimpleHTTPServer 8000
	then navigate to the folder and select the html file
Updates
	1. Updated layout 
		a. Has to be improved 
	2. Added buttons 
		a. No functions yet
	3. Updated axes
		a. Loads the JSON file already for the station names.
		b. Time domain has to be updated from the JSON file as well
		c. Main concern: How to plot the y values (stations) given that it should denote distance and not the ordinal values?
		


