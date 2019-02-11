import React, { Component } from 'react';
import {BlockButtonContainer, BlockButtonTextWrapper, BlockButtonArrowWrapper, BlockButtonSubTitle, BlockButtonDescription} from './GeneralFunctionComponentsStyle'
import {RightArrow} from '../../../src/assets/svg/svgs'

const BlockButton = props => (
    <BlockButtonContainer onClick = {props.onClickOfBlock}>
        <BlockButtonTextWrapper>
            <h2>{props.title}</h2>
            <BlockButtonSubTitle>{props.subTitle}</BlockButtonSubTitle>
            <BlockButtonDescription>{props.description}</BlockButtonDescription>
        </BlockButtonTextWrapper>
        <BlockButtonArrowWrapper>
            <RightArrow />
        </BlockButtonArrowWrapper>  
    </BlockButtonContainer> 
)

export {
    BlockButton
}