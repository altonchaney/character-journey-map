import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GiExitDoor } from 'react-icons/gi';

import { Installment, Character } from '../../models';
import ListItem from '../ListItem';
import Title from '../Title';
import './MapPanel.css';
import colors from '../../assets/colors';

const MapPanel = (
  props: {
    title: string,
    details?: { planet?: string, description?: string }
    characters: Character[],
    installments: Installment[],
    visibleRange: number[],
    selectedCharacters: string[], selectedInstallments: number[],
    selectCharacter: (name: string) => void,
    selectInstallment: (index: number) => void
  }
) => {
  const {
    title, details, characters, installments, visibleRange,
    selectedCharacters, selectedInstallments,
    selectCharacter, selectInstallment
  } = props;
  const [open, setOpen] = useState<boolean>(true);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);

  return (
    <div className='container'>
      <div className={`MapPanel content-container ${ open ? 'open' : '' }`}>
        <Link className='exit' to={'/'}><GiExitDoor size={15} color={colors.primary.whiteTransparent}/></Link>
        <Title title={title} subtitle='Series'/>
        {
          details &&
          <div
            className={`details-container ${ detailsVisible ? 'open' : '' }`}
            onClick={() => setDetailsVisible(!detailsVisible)}
          >
            <Title subtitle={detailsVisible ? 'Details' : 'See Details'}/>
            <ul>
              {
                Object.keys(details).map((key) => (
                  <li key={(details as any)[key]}><i>{ key[0].toUpperCase() + key.slice(1) }:</i> { (details as any)[key] }</li>
                ))
              }
            </ul>
          </div>
        }
        
        <Title subtitle='Characters'/>
        <div className='list-container'>
          {
            characters
              .filter(character => (
                !character.firstAppearance ||
                (
                  Math.max(...selectedInstallments) >
                  (Number(Object.keys(character.firstAppearance)[0]) - 1) ||
                  (
                    character.firstAppearance[Math.max(...selectedInstallments) + 1] &&
                    (
                      installments[Math.max(...selectedInstallments)].chapters[visibleRange[1]] &&
                      installments[Math.max(...selectedInstallments)].chapters[visibleRange[1]].chapter >=
                      character.firstAppearance[Math.max(...selectedInstallments) + 1].chapter
                    )
                  )
                )
              ))
              .map(character => (
                <ListItem
                  key={`character-item-${character.name}`}
                  selected={selectedCharacters.includes(character.name)}
                  title={character.name}
                  image={character.image}
                  color={character.color}
                  callback={() => selectCharacter(character.name)}
                />
              ))
          }
        </div>
        <Title subtitle='Installments'/>
        <div className='list-container'>
          {
            installments.map((Installment, index) => (
              <ListItem
                key={`Installment-item-${Installment.title}`}
                selected={selectedInstallments.includes(index)}
                title={Installment.title}
                image={Installment.image}
                callback={() => selectInstallment(index)}
              />
            ))
          }
        </div>
        <Title subtitle='Legend'/>
        <div className='legend-container'>
          <div className='indicator confirmed'>
            <p className='alt'>Confirmed Path</p>
          </div>
          <div className='indicator unconfirmed'>
            <p className='alt'>Unconfirmed Path</p>
          </div>
        </div>
      </div>
      <div className={`panel-control ${ open ? 'open' : '' }`} onClick={() => setOpen(!open)}>
        <p className='alt'>{ open ? 'Close' : 'Menu' }</p>
      </div>
      <div className={`CharacterList ${ open ? '' : 'visible' }`}>
        {
          characters
            .filter(character => (
              selectedCharacters.includes(character.name) &&
              (
                !character.firstAppearance ||
                (
                  Math.max(...selectedInstallments) >
                  (Number(Object.keys(character.firstAppearance)[0]) - 1) ||
                  (
                    character.firstAppearance[Math.max(...selectedInstallments) + 1] &&
                    installments[Math.max(...selectedInstallments)].chapters[visibleRange[1]] &&
                    (
                      installments[Math.max(...selectedInstallments)].chapters[visibleRange[1]].chapter >=
                      character.firstAppearance[Math.max(...selectedInstallments) + 1].chapter
                    )
                  )
                )
              )
            ))
            .map(character => (
              <ListItem
                key={`character-condensed-item-${character.name}`}
                selected={selectedCharacters.includes(character.name)}
                image={character.image}
                color={character.color}
              />
            ))
        }
      </div>
    </div>
  );
}

export default MapPanel;
