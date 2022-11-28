import React, { useEffect, useState } from 'react';
import { Range, getTrackBackground } from 'react-range';
import colors from '../../assets/colors';

import { Installment, Chapter, MediaType, MediaInstallment } from '../../models';
import './MapTimeline.css';


export type ChapterRange = { start: Chapter, end: Chapter };

const MapTimeline = (props: { installment: Installment, initialValue?: number[], callback: (range: number[]) => void }) => {
  const { installment, initialValue, callback } = props;
  const [selectedRange, setSelectedRange] = useState<number[]>([0, 0]);
  const [initialValueSet, setInitialValueSet] = useState<boolean>(false);

  const changeChapterRange = (e: number[]) => {
    setSelectedRange(e);
    callback(e);
  };

  useEffect(() => {
    initialValueSet && changeChapterRange([0, 0]);
  }, [installment]);

  useEffect(() => {
    if (!!initialValue && !initialValueSet) {
      changeChapterRange(initialValue);
      setInitialValueSet(true);
    }
  }, [initialValue]);

  return (
    <div className='MapTimeline'>
      <div className='content-container'>
        <p className='alt'>{ installment.title } { MediaInstallment[installment.type] } List</p>
        <div className='scroll-container'>
          <div
            className='range-container'
            style={{
              width: 25 * installment.chapters.length
            }}
          >
            <Range
              values={selectedRange}
              step={1} min={0} max={installment.chapters.length - 1}
              onChange={(values) => changeChapterRange(values)}
              renderMark={({ props, index }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    marginTop: 5,
                    marginLeft: index ? -1 : 0,
                    width: 1,
                  }}
                >
                  <div
                    style={{
                      height: 10,
                      width: '100%',
                      backgroundColor: colors.primary.whiteTransparent
                    }}
                  />
                  <p
                    className='alt'
                    style={{
                      marginTop: 0,
                      whiteSpace: 'nowrap',
                      transform: 'rotate(30deg)',
                      textAlign: 'right',
                      letterSpacing: 0
                    }}
                  >
                    {
                      installment.chapters[index] &&
                      (installment.chapters[index].altName || `${ MediaInstallment[installment.type].slice(0, 2) }. ${installment.chapters[index].chapter}`)
                    }
                  </p>
                </div>
              )}
              renderTrack={({ props, children }) => (
                <div
                  onMouseDown={props.onMouseDown}
                  onTouchStart={props.onTouchStart}
                  style={{
                    ...props.style,
                    height: '36px',
                    display: 'flex',
                    width: '100%',
                    borderRadius: 0
                  }}
                >
                  <div
                    ref={props.ref}
                    style={{
                      height: '5px',
                      width: '100%',
                      background: getTrackBackground({
                        values: selectedRange,
                        colors: [colors.primary.whiteTransparent, colors.primary.lightGray, colors.primary.whiteTransparent],
                        min: 0,
                        max: installment.chapters.length - 1
                      }),
                      alignSelf: 'center'
                    }}
                  >
                    {children}
                  </div>
                </div>
              )}
              renderThumb={({ props }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    outline: 'none',
                    height: 24,
                    width: 24,
                    borderRadius: '50%',
                    backgroundColor: colors.primary.white,
                    boxShadow: colors.primary.shadow
                  }}
                ></div>
              )}
            />
          </div>
        </div>
        
        
      </div>
    </div>
  );
}

export default MapTimeline;
