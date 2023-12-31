// -----M-O-D-E-L----- //
var eating_joints = [{
	name: "Konya Mutfağı",
	lat: 37.87157,
	lng: 32.50265,
	show: true,
	unique: "50d6d789498ee282996ddce4",
	selected: false
}, {
	name: "Havzan Etli Ekmek",
	lat: 37.86798,
	lng: 32.46555,
	show: true,
	unique: "4ed9f3d002d5244e2feb0b30",
	selected: false
}, {
	name: "Konya Kebap Evi",
	lat: 37.91848,
	lng: 32.51221,
	show: true,
	unique: "4f0dae1ee4b0254b4cfd9521",
	selected: false
}, {
	name: "Asya Lahmacun & Kebap",
	lat: 37.88529,
	lng: 32.48715,
	show: true,
	unique: "4ec86d0a9a52756c56e1cb08",
	selected: false
}, {
	name: "SOMUNCU BABA KEBAP &PİDE",
	lat: 37.91135,
	lng: 32.52481,
	show: true,
	unique: "4eed801ae5faa560f14ec5fb",
	selected: false
}];

/* Global değişkenler */

// Çizim Araçları için polygon değişkeni
var polygon = null;
// Harita değişkeni
var self = this;
// Marker değişkeni
self.markers = [];

// Modeli Görüntüle //

var viewModel = function () {

	// Harita yükleyici
	var mapInfoWindow = new google.maps.InfoWindow();
	for (i = 0; i < eating_joints.length; i++) {
		// İşaretçinin Nesnesi
		var marker = new google.maps.Marker({
			position: {
				lat: eating_joints[i].lat,
				lng: eating_joints[i].lng
			},
			map: map,
			name: eating_joints[i].name,
			foodid: eating_joints[i].unique,
			// Bağlama listesi için kullanılan KO
			show: ko.observable(true),
			// Google Haritalar İşaretleme Animasyonu
			animation: google.maps.Animation.DROP
		});

		// 		İşaretleyicileri tek tek işaretleyici dizisine itme
		self.markers.push(marker);

		// Tıklatıldığında söz konusu işaretçi için InfoWindow'u açan işlev
		marker.addListener('click', function () {
			placesInfoWindow(this, mapInfoWindow);
			// Animation on selecting a particular marker
			this.setAnimation(google.maps.Animation.DROP);
		});

		
		// Two event listeners - one for mouseover, one for mouseout,
		// to change the colors back and forth.
		marker.addListener('mouseover', function () {
			this.setIcon(highlightedIcon);
		});
		marker.addListener('mouseout', function () {
			this.setIcon(defaultIcon);
		});

	}
	// Function to fetch information from API for each marker
	self.fetchData = function (marker) {
		// Ajax Request
		$.ajax({
			type: "GET",
			// Url with Unique Client Id and Unique Client Secret Id for this project
			url: "https://api.foursquare.com/v2/venues/" + marker.foodid + "?ll=40.7,-74&client_id=XQ2I0ONGSSVL1DYQYSK2Q0ERIM5ASTRANA5FRG41HTTXVKQB&client_secret=XIEY0CCAJUQ5U04C5XOLGDF3LGUXZ2GVWLEMCIWQ1FRZD4NQ&v=20170510",
			dataType: "json",
			// Success  method. Called if data fetching is successful
			success: function (data) {
				// stores ratings to be displayed
				var rt = data.response.venue;
				// adds rating to the marker
				marker.rating = rt.hasOwnProperty('rating') ? rt.rating : "";
			},
			// Error method. Called if data fetching fails
			error: function (e) {
				marker.rating = "Failed to fetch data";
			}
		});
	};

	// Fucntion called to display the marker with animation and pop-up the infowindow
	this.showMarker = function (marker) {
		placesInfoWindow(marker, mapInfoWindow);
		marker.selected = true;
		marker.setAnimation(google.maps.Animation.DROP);
		navToggle();
	};

	// Function call for ajax request. Iterating for all markers
	for (var p = 0; p < self.markers.length; p++) {
		self.fetchData(self.markers[p]);
	}

	// Function for the infowindow which displays the details of the place.
	function placesInfoWindow(marker, infowindow) {
		infowindow.setContent('<div>Name: ' + marker.name + '<br>Rating: ' + marker.rating + '</div>');
		infowindow.open(map, marker);
		infowindow.addListener('closeClick', function () {
			infowindow.close();
		});

	}

	// Knockout js for binding data for Search Bar
	this.input = ko.observable('');
	this.searchBar = function () {
		var filter = this.input();
		// Loop through all list items, and hide those who don't match the search query
		for (var i = 0; i < markers.length; i++) {
			if (filter.length === 0) {
				for (i = 0; i < markers.length; i++) {
					markers[i].show(true);
					markers[i].setVisible(true);
				}
			} else {
				for (i = 0; i < markers.length; i++) {
					if (markers[i].name.toLowerCase().indexOf(filter.toLowerCase()) > -1) {
						markers[i].show(true);
						markers[i].setVisible(true);
					} else {
						markers[i].show(false);
						markers[i].setVisible(false);
					}
				}
			}
		}
	};

	

	// This function will loop through the markers array and display them all.
	function showListings() {
		var bounds = new google.maps.LatLngBounds();
		// Extend the boundaries of the map for each marker and display the marker
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
			bounds.extend(markers[i].position);
		}
		map.fitBounds(bounds);
	}

	// This function will loop through the listings and hide them all.
	function hideListings() {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
	}

	

	// This function takes in a COLOR, and then creates a new marker
	// icon of that color. The icon will be 21 px wide by 34 high, have an origin
	// of 0, 0 and be anchored at 10, 34).
	function makeMarkerIcon(markerColor) {
		var markerImage = new google.maps.MarkerImage(
			'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
			'|40|_|%E2%80%A2',
			new google.maps.Size(21, 34),
			new google.maps.Point(0, 0),
			new google.maps.Point(10, 34),
			new google.maps.Size(21, 34));
		return markerImage;
	}
	// Style the markers a bit. This will be our listing marker icon.
	var defaultIcon = makeMarkerIcon('0091ff');
	// Create a "highlighted location" marker color for when the user
	// mouses over the marker.
	var highlightedIcon = makeMarkerIcon('FFFF24');

	

	// This shows and hides (respectively) the drawing options.
	this.toggleDrawing = function () {
			if (drawingManager.map) {
				drawingManager.setMap(null);
				// In case the user drew anything, get rid of the polygon
				if (polygon !== null) {
					polygon.setMap(null);
				}
			} else {
				drawingManager.setMap(map);
			}
			showListings();
			navToggle();
		};
		// This function hides all markers outside the polygon,
		// and shows only the ones within it. This is so that the
		// user can specify an exact area of search.
	function searchWithinPolygon() {
		for (var i = 0; i < markers.length; i++) {
			if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
				markers[i].setMap(map);
			} else {
				markers[i].setMap(null);
			}
		}
	}

	// Initialize the drawing manager.
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.POLYGON,
		drawingControl: true,
		drawingControlOptions: {
			position: google.maps.ControlPosition.TOP_LEFT,
			drawingModes: [
				google.maps.drawing.OverlayType.POLYGON
			]
		}
	});

	// Add an event listener so that the polygon is captured,  call the
	// searchWithinPolygon function. This will show the markers in the polygon,
	// and hide any outside of it.
	drawingManager.addListener('overlaycomplete', function (event) {
		// First, check if there is an existing polygon.
		// If there is, get rid of it and remove the markers
		if (polygon) {
			polygon.setMap(null);
			hideListings(markers);
		}
		// Switching the drawing mode to the HAND (i.e., no longer drawing).
		drawingManager.setDrawingMode(null);
		// Creating a new editable polygon from the overlay.
		polygon = event.overlay;
		polygon.setEditable(true);
		// Searching within the polygon.
		searchWithinPolygon();
		// Make sure the search is re-done if the poly is changed.
		polygon.getPath().addListener('set_at', searchWithinPolygon);
		polygon.getPath().addListener('insert_at', searchWithinPolygon);
	});

};