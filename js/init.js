// Google Haritalar için initMap fonksiyonu
var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 37.8716, // Konya'nın enlemi
            lng: 32.4846  // Konya'nın boylamı
        },
        zoom: 14
    });
    ko.applyBindings(new viewModel());
}

function mapLoadError() {
    document.getElementById('map').innerHTML = "Harita, bir hata nedeniyle yüklenemedi."
}

navToggle = function () {
    $(".tog").toggleClass('toHide');
}
