// geo-choropleth-scatter - customScript
// Fetches GeoJSON and registers map
// EChartsRenderer interceptor automatically applies the data and option upon registration.
fetch("/data/geo/iceland.geo.json", {signal: typeof abortSignal !== 'undefined' ? abortSignal : undefined})
  .then(function(r){ return r.json(); })
  .then(function(geoJson){
    echarts.registerMap("iceland", geoJson);
  })
  .catch(function(e){ if (e.name !== 'AbortError') console.error('[geo-choropleth-scatter] GeoJSON load failed:', e); });