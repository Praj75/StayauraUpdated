function initializeMap(coordinates, mapToken) {
    if (!mapToken) {
        console.error('Mapbox access token is missing');
        return showMapError('Map configuration error');
    }

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        console.error('Invalid coordinates:', coordinates);
        return showMapError('Invalid location data');
    }

    try {
        mapboxgl.accessToken = mapToken;
        
        // Check if WebGL is supported
        if (!mapboxgl.supported()) {
            console.error('WebGL is not supported in this browser');
            return showMapError('Your browser does not support WebGL, which is required for the map');
        }
        
        // Clear any existing content in the map container
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = '';
        }
        
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: coordinates,
            zoom: 12,
            attributionControl: false,
            interactive: true,
            failIfMajorPerformanceCaveat: false,
            preserveDrawingBuffer: true
        });

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add marker
        new mapboxgl.Marker({
            color: '#FF385C',
            scale: 1.2
        })
        .setLngLat(coordinates)
        .addTo(map);

        // Handle map load event
        map.on('load', () => {
            console.log('Map loaded successfully');
            map.resize();
        });

        // Handle map errors
        map.on('error', (e) => {
            console.error('Map error:', e);
            showMapError('Error loading map');
        });

        return map;
    } catch (error) {
        console.error('Error initializing map:', error);
        showMapError('Failed to initialize map');
    }
}

function showMapError(message) {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="map-error">
                <i class="fas fa-map-marked-alt"></i>
                <p>${message}</p>
                <p class="map-error-subtitle">Please try refreshing the page</p>
            </div>
        `;
    }
}