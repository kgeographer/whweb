<?php
# Connect to PostgreSQL database
$conn = new PDO('pgsql:host=orbis-dev.stanford.edu;dbname=citynature','webapp','sl1ppy');

# Build SQL SELECT statement and return the geometry as a GeoJSON element
$sql = "SELECT *, public.ST_AsGeoJSON(public.ST_Transform((geom),4326)) as geojson FROM cities40points where name not in ('Dallas','Indianapolis','Louisville','Baltimore') order by name";

# if (isset ($_GET['c'])) {
# Try query or error
$rs = $conn->query($sql);
if (!$rs) {
    echo 'An SQL error occured.\n';
    exit;
}

# Build GeoJSON feature collection array
$geojson = array(
   'type' => 'FeatureCollection',
   'features' => array()
);

# Loop through rows to build feature arrays
while ($row = $rs->fetch(PDO::FETCH_ASSOC)) {
    $properties = $row;
    # Remove geojson and geometry fields from properties
    unset($properties['geojson']);
    unset($properties['geom']);
    $feature = array(
         'type' => 'Feature',
         'geometry' => json_decode($row['geojson'], true),
         'properties' => $properties
    );
    # Add feature arrays to feature collection array
    array_push($geojson['features'], $feature);
}

header('Content-type: application/json');
echo json_encode($geojson, JSON_NUMERIC_CHECK);
$conn = NULL;
/*}
else {
  handleError('Didn\'t get a city. PostgreSQL says "' . pg_last_error() . '"');
};*/
function handleError($string) {
  echo strip_tags(utf8_decode("ERROR:\n\n" . $string));
  die();
}
/**
* Title: PostGIS to GeoJSON
* Notes: Query a PostGIS table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
* Author: Bryan R. McBride, GISP
* Contact: bryanmcbride.com
* GitHub: https://github.com/bmcbride/PHP-Database-GeoJSON
*/
?>