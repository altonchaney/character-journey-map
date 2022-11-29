import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, ImageOverlay, Marker, Polyline, useMapEvents, ZoomControl, Tooltip } from 'react-leaflet';
import L, { DivIcon } from 'leaflet';
import {
  GiBrain, GiBrickWall
} from 'react-icons/gi';

import './Map.css';
import MapPanel from '../../components/MapPanel';
import MapTimeline from '../../components/MapTimeline';
import MapMarker from '../../components/MapMarker';
import colors from '../../assets/colors';
import { DataBundle } from '../../models';

const Coordinates = () => {
  const map = useMapEvents({
    click(e) {
      console.log([e.latlng.lat, e.latlng.lng])
    }
  });
  return <></>
};

const Map = (props: {name: string, data: DataBundle}) => {
  const { name, data } = props;
  const [activeMap, setActiveMap] = useState<'physical' | 'cognitive'>('physical');
  const [visibleCharacters, setVisibleCharacters] = useState<string[]>(data.characters.map(c => c.name));
  const [visibleInstallments, setVisibleInstallments] = useState<number[]>([0]);
  const [visibleRange, setVisibleRange] = useState<number[]>([0, 0]);
  const [initialRange, setInitialRange] = useState<number[]>();
  const valueHandler = useMemo(() => ({
    'Characters': visibleCharacters,
    'Installments': visibleInstallments,
    'Range': visibleRange,
  }), [visibleCharacters, visibleInstallments, visibleRange]);
  const valueSetterHandler = useMemo(() => ({
    'Characters': setVisibleCharacters,
    'Installments': setVisibleInstallments,
  }), []);

  const toggleVisibleCharacters = (characterName: string) => {
    let newVisibleCharacters: string[] = visibleCharacters.includes(characterName) ?
      visibleCharacters.filter(n => (n !== characterName)) : [...visibleCharacters, characterName];
    setVisibleCharacters(newVisibleCharacters);
    localStorage.setItem(`${name}-Characters`, JSON.stringify(newVisibleCharacters));
  };

  const toggleVisibleInstallments = (installmentIndex: number) => {
    const newVisibleInstallments: number[] = visibleInstallments.includes(installmentIndex) ?
      visibleInstallments.filter(i => (i !== installmentIndex)) : [...visibleInstallments, installmentIndex];
    setVisibleInstallments(newVisibleInstallments);
    localStorage.setItem(`${name}-Installments`, JSON.stringify(newVisibleInstallments));
    setInitialRange([0,0]);
  };

  const renderMarkers = useCallback((installmentIndex: number) => {
    const latestVisibleInstallment = Math.max(...visibleInstallments);
    var visibleRangeArray = [];
    for (let i = visibleRange[0]; i <= visibleRange[1]; i++) { visibleRangeArray.push(i); }
    const visibleChapters = Array.from(new Set(
      visibleRangeArray.map(
        (i) => (
          data.installments[latestVisibleInstallment].chapters[i] ?
          data.installments[latestVisibleInstallment].chapters[i].chapter : 0
        )
      )
    ));
    return data.markers
      .filter(marker => (
        marker.appearances[installmentIndex + 1] &&
        (
          latestVisibleInstallment > installmentIndex ||
          marker.appearances[installmentIndex + 1]
            .some(chapter => chapter && visibleChapters.includes(chapter.chapter))
        )
      ))
      .map(marker => (
        <Marker
          key={marker.title}
          icon={
            new DivIcon({
              html: renderToStaticMarkup(
                <MapMarker marker={marker} enlarged={latestVisibleInstallment === installmentIndex && marker.appearances[installmentIndex + 1].includes(data.installments[installmentIndex].chapters[visibleRange[1]])} />
              ),
              iconSize: latestVisibleInstallment === installmentIndex && marker.appearances[installmentIndex + 1].includes(data.installments[installmentIndex].chapters[visibleRange[1]]) ?
                [36, 36] : [22, 22],
              iconAnchor: latestVisibleInstallment === installmentIndex && marker.appearances[installmentIndex + 1].includes(data.installments[installmentIndex].chapters[visibleRange[1]]) ?
                [18, 18] : [11, 11],
            })
          }
          opacity={
            latestVisibleInstallment === installmentIndex ?
            1 : 0.6
          }
          position={marker.coordinates}
        >
          <Tooltip opacity={1}>
            <div className='tooltip' style={{ bottom: marker.coordinates[0] < 300 ? 0 : 'initial' }}>
              {marker.image && <img src={marker.image} alt={marker.type} />}
              <p className='alt'>{ marker.type }</p>
              <h2>{ marker.title }</h2>
              {marker.description && <p>{ marker.description }</p>}
              <label>{ marker.confirmed ? 'Confirmed' : 'Unconfirmed' }</label>
            </div>
          </Tooltip>
        </Marker>
      ))
  }, [visibleRange, visibleInstallments, data.installments, data.markers]);

  const renderPaths = useCallback((installmentIndex: number) => {
    const latestVisibleInstallment = Math.max(...visibleInstallments);
    return data.paths
      .filter(path => (
        visibleCharacters.includes(path.character.name) &&
        path.installment && data.installments[installmentIndex] &&
        path.installment.title === data.installments[installmentIndex].title &&
        visibleInstallments.includes(installmentIndex) &&
        (
          latestVisibleInstallment > installmentIndex ||
          (
            data.installments[installmentIndex].chapters[visibleRange[0]] && data.installments[installmentIndex].chapters[visibleRange[1]] &&
            data.installments[installmentIndex].chapters[visibleRange[0]].chapter <= path.chapter.chapter &&
            data.installments[installmentIndex].chapters[visibleRange[1]].chapter >= path.chapter.chapter
          )
        )
      ))
      .map((path, i) => (
        <Polyline
          stroke
          key={path.character.name + '-' + path.coordinates.join(',') + '-' + i}
          positions={path.coordinates}
          pathOptions={{
            color: path.character.color, 
            weight: latestVisibleInstallment === installmentIndex &&
              data.installments[installmentIndex].chapters[visibleRange[1]] &&
              data.installments[installmentIndex].chapters[visibleRange[1]].chapter === path.chapter.chapter ?
              8 : 4,
            dashArray: path.confirmed ? [0] : [1, 6],
            opacity: latestVisibleInstallment === installmentIndex ? 1 : 0.5
          }}
        />
      ))
  }, [visibleCharacters, visibleInstallments, visibleRange, data.installments, data.paths]);

  useEffect(() => {
    ['Characters', 'Installments'].forEach(key => {
      if (localStorage.getItem(`${name}-${key}`)) {
        const savedValue = JSON.parse(localStorage.getItem(`${name}-${key}`) as string);
        valueSetterHandler[key as ('Characters' | 'Installments')](savedValue);
      } else {
        localStorage.setItem(`${name}-${key}`, JSON.stringify(valueHandler[key as ('Characters' | 'Installments')]));
      }
    });

    if (!!localStorage.getItem(`${name}-Range`) && !initialRange) {
      setInitialRange(JSON.parse(localStorage.getItem(`${name}-Range`) as string));
    }
  }, [name]);

  return (
    <div className='map'>
      <MapContainer
        crs={L.CRS.Simple}
        style={{width: '100vw', height: '100%', overflow: 'hidden', backgroundColor: data.backgroundColor, zIndex: 0}}
        maxBounds={[
          [
            0 - (data.map.dimensions[0] / 4),
            0 - (data.map.dimensions[1] / 4)
          ],
          [
            data.map.dimensions[0] + (data.map.dimensions[0] / 4),
            data.map.dimensions[1] + (data.map.dimensions[1] / 4)
          ]
        ]}
        center={[data.map.dimensions[0] / 2,data.map.dimensions[1] / 2]}
        zoom={0}
        minZoom={-1} maxZoom={1}
        attributionControl={false}
        zoomControl={false}
      >
        <ZoomControl position='topright' />
        <ImageOverlay
          url={activeMap === 'cognitive' && data.map.altImage ? data.map.altImage : data.map.image}
          zIndex={-1}
          bounds={[[0,0], data.map.dimensions]}
          className='map'
        />
        { visibleInstallments.map(i => renderMarkers(i)) }
        { visibleInstallments.map(i => renderPaths(i)) }
        <Coordinates />
      </MapContainer>
      <MapPanel
        title={data.title}
        characters={data.characters}
        installments={data.installments}
        selectCharacter={toggleVisibleCharacters}
        selectInstallment={toggleVisibleInstallments}
        selectedCharacters={visibleCharacters}
        selectedInstallments={visibleInstallments}
        visibleRange={visibleRange}
        details={
          data.description ?
          {
            planet: data.planetName,
            timeframe: data.timeframe,
            description: data.description
          }: undefined
        }
      />
      {
        visibleInstallments.length &&
        <MapTimeline
          installment={data.installments[Math.max(...visibleInstallments)]}
          initialValue={initialRange}
          callback={(range) => {
            range.sort((a, b) => (a - b));
            setVisibleRange(range);
            localStorage.setItem(`${name}-Range`, JSON.stringify(range));
          }}
        />
      }
      {
        data.map.altImage &&
        <div className='realm-toggle'>
          <div
            onClick={() => setActiveMap('physical')}
            className={`physical ${ activeMap === 'physical' ? 'active' : '' }`}
          >
            <GiBrickWall
              color={
                activeMap === 'physical' ?
                colors.primary.black :
                colors.primary.white
              }
              size={16}
            />
          </div>
          <div
            onClick={() => setActiveMap('cognitive')}
            className={`cognitive ${ activeMap === 'cognitive' ? 'active' : '' }`}
          >
            <GiBrain
              color={
                activeMap === 'cognitive' ?
                colors.primary.black :
                colors.primary.white
              }
              size={16}
            />
          </div>
        </div>
      }
      {
        data.map.source &&
        <a className='source-link' href={data.map.source} target='_blank' rel='noreferrer noopener'>
          <p className='alt'>
            Map Source
          </p>
        </a>
      }
    </div>
  );
}

export default Map;
