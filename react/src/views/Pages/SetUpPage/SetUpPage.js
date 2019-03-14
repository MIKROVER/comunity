import React, { Component } from 'react';
import { withTheme } from 'styled-components';
import CommonUtils, {PRODUCTS} from '../../../utils/CommonUtils';
import SelectStep from './SelectSteps';
import Step3 from './Step3';
import Step2 from './Step2';
import Step1 from './Step1';
import './setup.css';
import Testimonials from '../Register/Testimonials';
import Mikolaj from '../Register/Testimonials/Images/Mikolaj.jpg';
import Alex from '../Register/Testimonials/Images/AlexKlein.jpg';



class SetUpPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			step: 2,
			isSelectStepHidden:false,
			disableAnchor:true,
			customerDetail:{},//{websiteUrl:'https://applozic.com',name:'default'},
		}
		this.moveToNextStep=this.moveToNextStep.bind(this);
	}

	moveToNextStep=(data, step)=>{
		this.setState({
			customerDetail: Object.assign(this.state.customerDetail, data),
			step: step
		})
	}

	componentWillMount(){
		if(this.props.location && this.props.location.pathname ==="/installation" &&this.props.location.search){
			this.state.disableAnchor=false;
		}
		if(this.props.hideSkipForNow){
			this.state.step=3;
		}
	}
	
	render() {
		const Logo = PRODUCTS[CommonUtils.getProduct()].logo;
		const productTitle = PRODUCTS[CommonUtils.getProduct()].title;
		return (
			<div className="app setup-pages-bg">
				<div className="setup-pages-form-container">
					<div className="setup-pages-form-fields-container">
						<div className="logo-container text-center">
							<Logo/>
						</div>

						<hr className="hr"/>

						<div className={(this.state.step === 3) ? "step-3-div-card col-md-6 card" : "card"}>
							{this.state.step === 1 ? 
								<Step1 moveToNextStep={this.moveToNextStep} hideSkipForNow={this.props.hideSkipForNow} location={this.props.location} />
								: this.state.step === 2 ? 
									<Step2 moveToNextStep={this.moveToNextStep} customerInfo={this.state.customerDetail} history={this.props.history}/> 
								: <Step3 customerInfo={this.state.customerDetail} hideSkipForNow={this.props.hideSkipForNow} history={this.props.history}/>
							}
						</div>
					</div>
				</div>
				<div className="setup-pages-testimonial-container">
					<Testimonials testimonialFace={testimonialTexts[productTitle].face} testimonialAuthor={testimonialTexts[productTitle].author} testimonialCompany={testimonialTexts[productTitle].company} testimonialText={testimonialTexts[productTitle].text} />
				</div>
			</div>
		)
	}
}

const testimonialTexts = {
	"Applozic" : {
	  face: Alex,
	  author: "Alex Klein",
	  company: "YogaTrail",
	  text: "Super easy, powerful addition to our site and the team couldn’t have been any more responsive and helpful."
	},
	"Kommunicate" : {
	  face: Mikolaj,
	  author: "Mikolaj Kulesz",
	  company: "Zoovu",
	  text: "We wanted a simple Dialogflow integration and not many chat providers have that functionality. Not only the integration is super easy, Kommunicate provides great customer support. On top of that, they do listen to the client's needs and requests."
	}
}

export default withTheme(SetUpPage);