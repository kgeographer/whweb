<?php
$qterms = $_GET['q'];

# Connect to PostgreSQL database
$conn = new PDO('pgsql:host=orbis-dev.stanford.edu;dbname=heritage','karlg','p0stg1s');

# Build SQL SELECT statement and return the geometry as a GeoJSON element
$sql = "SELECT el_id,title,year,countries,description,nphrases, verbs,region,ST_AsGeoJSON(st_centroid(iregions.geom)) AS centroid FROM elements JOIN iregions ON elements.region=iregions.objectid WHERE fts @@ to_tsquery('$qterms') ORDER BY el_id";

if (isset ($_GET['q'])) {
# Try query or error
//echo $sql;
$rs = $conn->query($sql);
if (!$rs) {
    echo 'An SQL error occurred.\n';
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
    unset($properties['centroid']);
    $feature = array(
         'type' => 'Feature',
         'geometry' => json_decode($row['centroid'], true),
         'properties' => $properties
    );
    # Add feature arrays to feature collection array
    array_push($geojson['features'], $feature);
}

header('Content-type: application/json');
echo json_encode($geojson, JSON_NUMERIC_CHECK);
$conn = NULL;
}
else {
  handleError('Didn\'t get a city. PostgreSQL says "' . pg_last_error() . '"');
};
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