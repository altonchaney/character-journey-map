import React, { useEffect, useState } from 'react';
import { Range, getTrackBackground } from 'react-range';
import colors from '../../assets/colors';

import { Installment, MediaInstallment } from '../../models';
import './MapTimeline.css';


const MapTimeline = (props: { installment: Installment, initialEnd?: number, callback: (end: number) => void }) => {
  const { installment, initialEnd, callback } = props;
  const [selectedEnd, setselectedEnd] = useState<number>(0);
  const [initialEndSet, setInitialEndSet] = useState<boolean>(false);

  const changeEndChapter = (e: number) => {
    setselectedEnd(e);
    callback(e);
  };

  useEffect(() => {
    initialEndSet && changeEndChapter(0);
  }, [installment]);

  useEffect(() => {
    if (!!initialEnd && !initialEndSet) {
      changeEndChapter(initialEnd);
      setInitialEndSet(true);
    }
  }, [initialEnd]);

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
              values={[selectedEnd]}
              step={1} min={0} max={installment.chapters.length - 1}
              onChange={(values) => changeEndChapter(values[0])}
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
                        values: [selectedEnd],
                        colors: [colors.primary.lightGray, colors.primary.whiteTransparent],
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
