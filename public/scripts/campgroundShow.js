const campgroundImgs = document.querySelectorAll('.campground-img');

const parsedCampground = JSON.parse(campground);

for (let i = 0; i < campgroundImgs.length; i += 2) {
    campgroundImgs[i].addEventListener('error', () => {
        campgroundImgs[i].classList.add('hide');
        campgroundImgs[i+1].classList.remove('hide');
    })
}

mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
    container: 'showMap', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: parsedCampground.geometry.coordinates, // starting position [lng, lat]
    zoom: 7, // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => {
    const popupText = `<h6>${parsedCampground.properties.title}</h6>`;
    map.addSource('places', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'properties': {
                        'description': popupText
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': parsedCampground.geometry.coordinates
                    }
                }
            ]
        }
    });

    map.addLayer({
        'id': 'places',
        'type': 'circle',
        'source': 'places',
        'paint': {
        'circle-color': '#4264fb',
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
        }
    })

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'places', (e) => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(description).addTo(map);
    });

    map.on('mouseleave', 'places', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
});

const marker = new mapboxgl.Marker()
    .setLngLat(parsedCampground.geometry.coordinates)
    .addTo(map);