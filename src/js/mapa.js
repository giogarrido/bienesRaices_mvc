
(function() {

    const lat = 27.497080193218;
    const lng = -109.932805484352;
    const mapa = L.map('mapa').setView([lat, lng ], 13);
    let marker

    // Utilizar Provider  y GeoCoder
    const geocodeService = L.esri.Geocoding.geocodeService();
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Agregar el pin
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    }).addTo(mapa)

    // Detectar movimiento del marker

    marker.on('moveend', function(e) {
        marker = e.target;
        const posicion = marker.getLatLng();
        mapa.panTo( new L.LatLng( posicion.lat, posicion.lng ) );

        // Obtenr la informacion de las coordenadas al mover el pin
        geocodeService.reverse().latlng(posicion, 13).run(function(error, resultado) {
            // console.log(resultado.address);
            marker.bindPopup(resultado.address.LongLabel);
            marker.openPopup();

            // Llenar los campos
            document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        })

    });


})()