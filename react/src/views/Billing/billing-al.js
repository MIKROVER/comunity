import React, { Component } from 'react';
import styled, { css } from 'styled-components';
// import Stripe from 'stripe';
import CommonUtils from '../../utils/CommonUtils';
import './billing.css';
import AnalyticsTracking from '../../utils/AnalyticsTracking';
import ApplozicClient, {SUBSCRIPTION_PACKAGES, PRICING_PLANS} from '../../utils/applozicClient';
import { getConfig } from '../../config/config';
import MultiToggleSwitch from '../../components/MultiToggleSwitch';
import Button from '../../components/Buttons/Button';
import { SettingsHeader } from '../../components/SettingsComponent/SettingsComponents';
import AlBillingPlansTables from './AlBillingPlansTables';

// const stripe = Stripe(getConfig().applozic.stripe);

class BillingApplozic extends Component {

    constructor(props) {
        super(props);

        let subscription = CommonUtils.getUserSession().subscription;
        if (typeof CommonUtils.getUserSession().subscription === 'undefined' || CommonUtils.getUserSession().subscription == '' || CommonUtils.getUserSession().subscription == '0') {
            subscription = 'startup';
        }

        let that = this;
        let stripeHandler = StripeCheckout.configure({
            key: getConfig().applozic.stripe,
            image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
            locale: 'auto',
            token: function(token) {
                that.state.stripeHandlerCallback(token);
            }
          });

        this.state = {
            stripeHandler: stripeHandler,
            stripeHandlerCallback: that.subscribe,
            modalIsOpen: false,
            subscription: subscription,
            currentPlan: '',
            trialLeft: 0,
            showPlanSelection: false,
            currentPlanDetailsText: "Trial period plan details",
            seatsBillable: "",
            planHeading: "",
            nextBillingDate: 0,
            totalPlanAmount: 0,
            disableSelectedPlanButton: false,
            clickedPlan:  'startup',
            currentModal: "",
            billingCycleText: "Monthly",
            hidePlanDetails: true,
            pricingPackage: 0
        };

        this.buyPlan = this.buyPlan.bind(this);
        this.changeCardClick = this.changeCardClick.bind(this);
    };

    componentDidMount() {
          // Close Checkout on page navigation:
        window.addEventListener('popstate', function() {
            this.state.stripeHandler.close();
        });
    }

    buy(token) {
        // let value = 2; //index selected from the pricing slider;
        let pricingPackage = this.pricingPackage;
        // let quantity = 5; //selected number of MAU/1000

        // Removing quantity as it is not needed for new plans.
        ApplozicClient.subscribe(token, pricingPackage);
    }

    processBuyPlan = (e) => {
        let pricingPackage = e.target.getAttribute("data-pricing-package");
        ApplozicClient.subscribe(token, pricingPackage);
    }

    buyPlan(e) {
        this.setState({
            pricingPackage: e.target.getAttribute("data-pricing-package")
        })
        this.state.stripeHandlerCallback = this.buy;
        this.state.stripeHandler.open({
            name: 'Applozic, Inc',
            description: 'Chat SDK',
            panelLabel: 'Pay',
            amount: e.target.getAttribute("data-plan-amount")
          });
        
        AnalyticsTracking.acEventTrigger("ac-choose-plan");  
    }

    changeCardClick(e) {
        this.state.stripeHandlerCallback = ApplozicClient.changeCard;
        this.state.stripeHandler.open({
            name: 'Applozic, Inc',
            description: 'Update Card',
            panelLabel: 'Update Card',
          });
    }

    onBillingCyclesSelect = value => {
        this.setState({ 
            billingCycleText: value
        });
    }

    togglePlanDetails = () => {
        this.setState({
            hidePlanDetails: !this.state.hidePlanDetails
        })
    }

    render() {
        let status = SUBSCRIPTION_PACKAGES[CommonUtils.getUserSession().application.pricingPackage];
        let planMAU = CommonUtils.getUserSession().application.supportedMAU;
        let currentPricingPackage = CommonUtils.getUserSession().application.pricingPackage;

        return (
            <Container className="animated fadeIn">

                <SettingsHeader  />
                <div className="container">
                    
                    <PlanBoughtContainer>
                        <PlanBoughtActivePlanContainer>
                            <div>Your plan:</div>
                            <div><span>{status}</span> <span style={{textTransform: "uppercase"}}>yearly BILLING</span></div>
                        </PlanBoughtActivePlanContainer>
                        {/* <PlanBoughtNextBillingDateContainer>
                            <div>Next billing:</div>
                        </PlanBoughtNextBillingDateContainer> */}
                        <PlanChangeCardContainer>
                            <Button secondary link type="submit" value="Change Card" onClick={this.changeCardClick}>Change Card</Button>
                        </PlanChangeCardContainer>
                    </PlanBoughtContainer>

                    <MultiToggleSwitch
                        options={billingCycleOptions}
                        selectedOption={this.state.billingCycleText}
                        onSelectOption={this.onBillingCyclesSelect}
                        label="Upgrade to one of our paid plans for premium features"
                        className="al-billing-cycle-toggle"
                    />

                    <div className="row">
                        {(currentPricingPackage > 0 && currentPricingPackage <= 27) ? "" : 
                            <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                                <AlBillingPlansTables className="al-starter-plan" briefText="For startups" planTitle="Starter" planAmount={PLANS[this.state.billingCycleText].starter} billingCycleText={this.state.billingCycleText} mauText="1000" planDetails={planDetails.starterPlan} primaryButton={false} togglePlanDetails={this.togglePlanDetails} hidePlanDetails={this.state.hidePlanDetails} everythingText="" buyPlan={this.buyPlan}
                                />
                            </div>
                        }
                        <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                            <AlBillingPlansTables className="al-growth-plan" briefText="For growing businesses" planAmount={PLANS[this.state.billingCycleText].growth} planTitle="Growth" billingCycleText={this.state.billingCycleText} mauText="10,000" planDetails={planDetails.growthPlan} primaryButton={true} togglePlanDetails={this.togglePlanDetails} hidePlanDetails={this.state.hidePlanDetails} everythingText="Starter" buyPlan={this.buyPlan}
                            />
                        </div>
                        <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                            <AlBillingPlansTables className="al-pro-plan" briefText="For mid-sized companies" planAmount={PLANS[this.state.billingCycleText].pro} planTitle="Pro" billingCycleText={this.state.billingCycleText} mauText="100,000" planDetails={planDetails.proPlan} primaryButton={false} togglePlanDetails={this.togglePlanDetails} hidePlanDetails={this.state.hidePlanDetails} everythingText="Growth" buyPlan={this.buyPlan}
                            />
                        </div>
                        <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                            <AlBillingPlansTables className="al-enterprise-plan" briefText="For enterprises" planAmount={"CUSTOM PRICING"} planTitle="Enterprise" billingCycleText={this.state.billingCycleText} mauText="Unlimited" planDetails={planDetails.enterprisePlan} primaryButton={false} togglePlanDetails={this.togglePlanDetails} hidePlanDetails={this.state.hidePlanDetails} everythingText="Pro" buyPlan={this.buyPlan}
                            />
                        </div>
                    </div>


                    <ContactUsContainer>
                        <ContactUsText>
                            For downgrading your account or unsubscribing drop a line on <a href="mailto:support@applozic.com">support@applozic.com</a>
                        </ContactUsText>
                    </ContactUsContainer>


           
                    Current plan: {status} | MAU: {planMAU}
                        <br></br>
                    <Button type="submit" value="Buy" onClick={this.buyPlan}>Buy</Button>
                </div>
            </Container>
        );
    }
}


const billingCycleOptions = [
    {
        displayName: "Monthly",
        value: "Monthly"
    },
    {
        displayName: "Quarterly",
        value: "Quarterly"
    },
    {
        displayName: "Yearly (20% off)",
        value: "Annually"
    }
];

const planDetails = {
    "starterPlan": ["Native Android, iOS & Ionic/PhoneGap SDK", "Unlimited concurrent connections", "Lifetime Message History Retention", "One-to-one & Group chat", "Attachment Sharing", "Push Notifications", "Complimentary Live Chat Plugin (2 Agent Plan)", "Standard Hosting"], 

    "growthPlan": ["Broadcast Messages", "Admin Announcements", "Webhooks Support", "Email Notifications", "Downloadable Reports", "Profanity Filters", "User Moderation", "End-to-end Encryption", "No Applozic Branding"],

    "proPlan": ["No Applozic Branding", "Live Streaming Chat", "Localization Support", "Custom Reports ", "Complimentary Live Chat Plugin (3 Agent Plan)", "Conversation Routing", "Choice of hosting region", "Service Level Agreement", "Phone Support"],

    "enterprisePlan": ["Unlimited Group Member Limit", "Dedicated (Single-Tenant) Hosting", "On-Prem (Self) Hosting", "Complimentary Live Chat Plugin (Upto 10 Agents)", "Bots & Automation", "Choice of Support Channel", "Dedicated Account Manager"]
};

const PLANS = {
    "Monthly": {
        "starter": {
            "amount": 49,
            "mau": 1000,
            "pricingPackage": 28,
            "subscriptionId": "starter_plan_monthly"
        },
        "growth": {
            "amount": 149,
            "mau": 10000,
            "pricingPackage": 31,
            "subscriptionId": "growth_plan_monthly"
        },
        "pro": {
            "amount": 499,
            "mau": 100000,
            "pricingPackage": 34,
            "subscriptionId": "pro_plan_monthly"
        }
    },
    "Quarterly": {
        "starter": {
            "amount": 44,
            "mau": 1000,
            "pricingPackage": 29,
            "subscriptionId": "starter_plan_quarterly"
        },
        "growth": {
            "amount": 129,
            "mau": 10000,
            "pricingPackage": 32,
            "subscriptionId": "growth_plan_quarterly"
        },
        "pro": {
            "amount": 449,
            "mau": 100000,
            "pricingPackage": 35,
            "subscriptionId": "pro_plan_quarterly"
        }
    },
    "Annually": {
        "starter": {
            "amount": 39,
            "mau": 1000,
            "pricingPackage": 30,
            "subscriptionId": "starter_plan_annual"
        },
        "growth": {
            "amount": 119,
            "mau": 10000,
            "pricingPackage": 33,
            "subscriptionId": "growth_plan_annual"
        },
        "pro": {
            "amount": 399,
            "mau": 100000,
            "pricingPackage": 36,
            "subscriptionId": "pro_plan_annual"
        }
    }
};

const flex = css`
    display: flex;
    align-items: center;
    justify-content: flex-start;
`;
const Container = styled.div`
    max-width: 998px;
    & .col-lg-3 {
        padding: 0 20px;
    } 
    & .row {
        ${flex}
        justify-content: center;
        margin-top: 25px;
    }
    & .al-billing-cycle-toggle .toggle-container {
        max-width: 500px;
        margin: 0 auto;
    }
    & .al-billing-cycle-toggle label {
        font-size: 18px;
    }
`;
const PlanBoughtContainer = styled.div`
    padding-bottom: 20px;
    border-bottom: 1px solid #e9e9e9;
    margin-bottom: 0px;
`;
const PlanBoughtActivePlanContainer = styled.div`
    ${flex}

    & div:first-child {
        min-width: 125px;
    }
    & div {
        font-size: 18px;
        letter-spacing: 0.9px;
        color: #121212;
        margin-bottom: 7px;
    }
    & div:last-child span {
        border-radius: 2px;
        background-color: rgba(204, 231, 248, 0.7);
        padding: 3px 12px;
        text-transform: uppercase;
    }
`;
const PlanBoughtNextBillingDateContainer = styled(PlanBoughtActivePlanContainer)``;
const PlanChangeCardContainer = styled.div`
    & button {
        margin-left: 110px;
        height: 20px;
    }
`;
const ContactUsContainer = styled.div`
    text-align: center;
`;
const ContactUsText = styled.p`
    font-size: 16px;
`;

export default BillingApplozic;
