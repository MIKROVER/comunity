import React, { Component } from 'react';
import axios from 'axios';
import validator from 'validator';
import {getConfig} from '../../.../../../config/config.js';
import { MenuItem, DropdownButton} from 'react-bootstrap';
import { resetPassword, getUserInfo } from '../../../utils/kommunicateClient';
import Notification from '../../model/Notification';
import CommonUtils from '../../../utils/CommonUtils';
import './login.css';
import ApplozicClient   from '../../../utils/applozicClient';
import ValidationUtils from  '../../../utils/validationUtils';
import { Buffer } from 'buffer';
import InputField from '../../../components/InputField/InputField';
import { Link } from 'react-router-dom';
import {COOKIES, USER_STATUS} from '../../../utils/Constant';
import kmloadinganimation from '../Register/km-loading-animation.svg';
import { connect } from 'react-redux'
import * as Actions from '../../../actions/loginAction'
import * as signUpActions from '../../../actions/signupAction'
import { persistor} from '../../../store/store';
import {KommunicateLogo, GoogleLogin}from '../../Faq/LizSVG'
import { ApplozicLogo, ShowPasswordIcon, HidePasswordIcon, ErrorIcon, BackButton, ConfirmationTick } from '../../../assets/svg/svgs';
import styled from 'styled-components';
import Button from '../../../components/Buttons/Button';

const Hr = styled.hr`
	width: 12%;
    border-top: 4px solid ${props => props.theme.primary};
    margin-top: 20px;
    margin-bottom: 0;
`;

class Login extends Component {

	constructor(props) {
		super(props);
		this.initialState = {
			userName:'',
			email:'',
			password:'',
			applicationId:'',
			applicationName:'',
			showAppListModal:false,
			hideUserNameInputbox:false,
			hidePasswordInputbox:false,
			hideAppListDropdown:true,
			loginFormText:"Login to Kommunicate",
			loginFormSubText:'Sign In to your account',
			loginButtonText:'Login',
			loginButtonAction:'Login',
			appIdList:{},
			dropDownBoxTitle:"Select Application.......",
			hideBackButton:true,
			loginButtonDisabled:false,
			hideSignupLink: false,
			isForgotPwdHidden:false,
			isLoginFrgtPassHidden: false,
			frgtPassSuccessConfirmation: true,
			subHeading:true,
			hideErrorMessage: true,
			errorMessageText: "Please enter user name to login",
			errorInputColor:'',
			errorMessageTextPassword:'',
			hideErrorMessagePassword: true,
			handleUserNameBlur:false,
			googleOAuth: false,
			loginType: 'email',
			hideGoogleLoginBtn:false,
			marginBottomFrgtPassHead:'',
			googleLoginUrl: getConfig().googleApi.googleApiUrl,
			next : "/dashboard"
		}
		this.showHide = this.showHide.bind(this);
		this.state=Object.assign({type: 'password'}, this.initialState);
		this.submitForm = this.submitForm.bind(this);
		this.websiteUrl = this.websiteUrl.bind(this);
	}
	
	componentWillMount() {
    this.props.setLogInStatus(false);
    this.props.setOnBoardingStatus(false);
    persistor.purge()
		const search = this.props.location.search;
		let referer = CommonUtils.getUrlParameter(search, 'referrer');
		if(referer) {
			var url = this.state.googleLoginUrl + "&state=" + referer;
			this.setState({next:referer, googleLoginUrl:url});
		}

		if(CommonUtils.getUserSession()) {
			window.location = this.state.next;
		}

		const googleLogin = CommonUtils.getUrlParameter(search, 'googleLogin');

		if(googleLogin === 'true'){
			const email = CommonUtils.getUrlParameter(search, 'email')
			const loginType = CommonUtils.getUrlParameter(search, 'loginType')
			const _numOfApp = CommonUtils.getUrlParameter(search, 'numOfApp')
			const applicationId = CommonUtils.getUrlParameter(search, 'applicationId')

			this.setState({
				googleOAuth: true,
				email: email,
				userName: email,
				password: '',
				loginButtonAction: 'Login',
				loginType: loginType,
				hideGoogleLoginBtn: true
			}, () => {
				Promise.resolve(this.login()).then( response => {
					if (_numOfApp == 1 && loginType === 'oauth') {
						this.submitForm();
					} else if (_numOfApp == 1 && (loginType === 'email' || loginType === 'null')) {
						getUserInfo(email, applicationId).then(response => {
							this.setState({
								userName: email,
								password: response.data.data.accessToken
							}, () => {
								this.submitForm()
							});
						});
					} else if (_numOfApp != 1 && (loginType === 'email' || loginType === 'null')) {
						this.setState({
							googleOAuth: false
						})
					}
				})
			})
		}

		var sheet = document.createElement('style')
		sheet.innerHTML = ".mck-sidebox-launcher {display: block;} .mck-sidebox-launcher.force-hide.vis {display: block !important;}";
		document.body.appendChild(sheet);

	}


	onKeyPress(e) {
		if (e.charCode == 13) {
			var login = document.getElementById('login-button');
			login.click();
		}
	}

	blurHandler(){
		//this.setState({handleUserNameBlur:true})
	}

	showHide(e){
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			type: this.state.type === 'password' ? 'input' : 'password'
		});
	}

	setEmail = (e) => {
		this.setState({email:e.target.value});
	}

	setUserName = (event) => {
		this.setState({userName:event.target.value});
	}

	setPassword = (event) => {
		this.setState({password:event.target.value});
	}

	backToLogin = () => {
		this.setState(this.initialState);
		this.props.history.push('/login');
	}

	handlePasswordResetResponse = (response) => {
		this.setState({
			loginFormSubText:'Password reset link has been sent', 
			isLoginFrgtPassHidden:true, 
			frgtPassSuccessConfirmation:false
		});
		// Notification.info("Password reset link has been sent on your mail!");
		console.log("response",response);
		// !response.err?this.backToLogin():null;
	}

	handlePasswordResetError = (response) => {
		var err = (response.response && response.response.data) ? response.response.data.message : "Somethimg went wrong!";
		Notification.error(err);
		console.log(response);
	}

	submitForm = () => {
		// alert("button clicked "+ this.state.userName+ "  "+this.state.password);
		//validateUser(this.state);
		var _this=this;

		let loginUrl = getConfig().kommunicateApi.login;

		var userName = this.state.userName, 
			password = this.state.password, 
			applicationName = this.state.applicationName, 
			applicationId = this.state.applicationId;
	
		if(!this.state.googleOAuth && (validator.isEmpty(this.state.userName) || validator.isEmpty(this.state.password))) {
			// Notification.warning("Email Id or Password can't be empty!");
			_this.setState({
				hideErrorMessagePassword: false,
				errorMessageTextPassword:"Email Id or Password can't be empty!"
			});
		
		} else {
			CommonUtils.analyticsIdentify(userName);

			if (this.state.loginType === 'oauth'){
				loginUrl += "?loginType=oauth"
			} else if (this.state.loginType === 'email'){
				loginUrl += "?loginType=email"
			}

			this.setState({loginButtonDisabled:true});
			
			axios.post( loginUrl, { userName: userName, password:password, applicationName:applicationName, applicationId:applicationId, deviceType:0}).then( function(response) {

				if(response.status == 200 && response.data.code == 'INVALID_CREDENTIALS') {
					// Notification.warning("Invalid credentials");
					_this.setState({hideErrorMessagePassword: false, errorMessageTextPassword:"Invalid Email Id or Password", loginButtonDisabled:false});
				} else if (response.status == 200 && response.data.result.status == USER_STATUS.EXPIRED) {
					_this.setState({ hideErrorMessagePassword: false, errorMessageTextPassword:"Your account has been temporarily disabled as trial period has ended. Please contact your admin to upgrade the plan.", loginButtonDisabled:false});
					return
				} else if (response.status == 200 && response.data.code == "MULTIPLE_APPS") {
					CommonUtils.setApplicationIds(response.data.result);
					_this.checkForMultipleApps(response.data.result);
					return;
				} 
			
				if (response.status == 200 && response.data.code == 'SUCCESS') {
					console.log("logged in successfully");
					if (typeof (Storage) !== "undefined") {

					if (window.$applozic && window.$applozic.fn && window.$applozic.fn.applozic("getLoggedInUser")) {
						window.$applozic.fn.applozic('logout');
					}

					if (response.data.result.apzToken) {
					} else {
						var apzToken = new Buffer(userName + ":" + password).toString('base64');
						response.data.result.apzToken = apzToken;
					}

					if (!response.data.result.application) {
						console.log("response doesn't have application, create {}");
						response.data.result.application = {};
					}

					_this.setState({'applicationId': response.data.result.application.applicationId});

					response.data.result.displayName=response.data.result.name;
					CommonUtils.setUserSession(response.data.result);
					_this.props.saveUserInfo(response.data.result);
					_this.props.setLogInStatus(true);
					}
					// _this.props.history.push("/dashboard");
					window.location.assign(_this.state.next);
					_this.state=_this.initialState;
				}
			}).catch( function(err) {
				console.log(err);
				Notification.error("Error during login.");
				_this.setState({loginButtonDisabled:false});
			});
		}
	}

	login = (event) => {
		var _this = this;
		if(this.state.loginButtonAction === "Login") {
			/*Promise.resolve(ApplozicClient.getUserInfoByEmail({"email":this.state.email,"applicationId":this.state.applicationId})).then(data=>{
			data?_this.state.userName=data.userId:_this.state.userName=_this.state.email;
			return this.submitForm();
			});*/
			this.setState({
				userName: this.state.email
			}, () => {
				return this.submitForm()
			});
		} else if(this.state.loginButtonAction==="passwordResetAppSected") {
			if(this.state.applicationId) {
				Promise.resolve(ApplozicClient.getUserInfoByEmail({"email":this.state.email,"applicationId":this.state.applicationId})).then(data=>{
					_this.state.userName=data.userId||_this.state.email;
					resetPassword({userName:this.state.userName,applicationId:this.state.applicationId}).then(_this.handlePasswordResetResponse).catch(_this.handlePasswordResetError);
					return;
				});
			} else {
				Notification.info("Please select your application");
				return;
			}
		} else {
			// console.log(this.state.loginButtonAction);
			if(!this.state.email && this.state.loginButtonAction ==="getAppList") {
				_this.setState({hideErrorMessage: false, errorMessageText:"Please enter user name to login"});
				return;
			}
			let param = ValidationUtils.isValidEmail(this.state.email)?"emailId":"userId";
			var urlEncodedName = encodeURIComponent(this.state.email);
			
			const getApplistUrl = getConfig().applozicPlugin.applicationList+"&"+param+"="+urlEncodedName;
			return  axios.get(getApplistUrl).then(function(response){
				_this.checkForMultipleApps(response.data);
			});
		}
	}
	checkForMultipleApps = (result) => {
		console.log(result);
		var _this = this;
		if(result!=="Invalid userId or EmailId") {
			const numOfApp=Object.keys(result).length;
			if(numOfApp===1) {
				_this.state.applicationId=Object.keys(result)[0];
				_this.state.applicationName=result[_this.state.applicationId];
				_this.state.appIdList= result;
				if(_this.state.loginButtonAction == "passwordReset") {
					resetPassword({userName:_this.state.userName||_this.state.email,applicationId:_this.state.applicationId}).then(_this.handlePasswordResetResponse).catch(_this.handlePasswordResetError);
					return 1;
				}
				_this.setState({
					loginButtonText:'Login',
					loginButtonAction:'Login',
					loginFormSubText:'Enter password to continue ',
					hidePasswordInputbox:false,
					hideAppListDropdown:true,
					hideUserNameInputbox:true,
					loginFormText:"Password",
					hideBackButton:false,
					isForgotPwdHidden:false, 
					hideSignupLink:false
				});
			} else if(numOfApp>1) {
				_this.state.appIdList= result;
				if(_this.state.loginButtonAction=="passwordReset") {
					_this.setState({
						loginButtonText:'Submit',
						loginButtonAction:'passwordResetAppSected',
						loginFormSubText:'please select your application and submit',
						hidePasswordInputbox:true,
						hideAppListDropdown:false,
						hideUserNameInputbox:true,
						loginFormText:"Select Application..",
						hideBackButton:false,
						hideSignupLink:true,
						isForgotPwdHidden:true,
						hideSignupLink:true,
						hideGoogleLoginBtn:true
					});					
				} else {
					_this.setState({
						loginButtonDisabled:false, 
						loginButtonText:'Login',
						loginButtonAction:'Login',
						loginFormSubText:'You are registered in multiple applications',
						hidePasswordInputbox:false,
						hideAppListDropdown:false,
						hideUserNameInputbox:true,
						loginFormText:"Hi! Select your application",
						subHeading:false,
						hideBackButton:false,
						isForgotPwdHidden:true,
						hideSignupLink:false,
						hideSignupLink:true, 
						hideGoogleLoginBtn:true
					});
					if (this.state.googleOAuth){
						_this.props.history.push("/apps?referrer="+_this.state.next, {
							userid: _this.state.userName, 
							pass: "",loginType :'oauth'
						});
					} else {
						_this.props.history.push("/apps?referrer="+_this.state.next, {
							userid: _this.state.userName, 
							pass: _this.state.password
						});
					}
				}
			} else {
				// Notification.info("You are not a registered user. Please sign up!!!");
				_this.setState({
					hideErrorMessage: false, 
					errorMessageText:"You are not a registered user. Please sign up."
				});
			}
			return numOfApp;
		} else {
			console.log("err while getting application list, response : ",result);
			Notification.error(result);
		}
	}

	register = (event) => {
		this.props.history.push("/signup");
	}

	initiateForgotPassword = (event) => {
		// this.state.loginButtonAction="passwordReset";
		this.setState({
			loginFormText: "Reset your password",
			loginFormSubText: 'Please enter your registered email ID, your password reset link will be sent there.',
			loginButtonText:'Submit',
			loginButtonAction:'passwordReset',
			hideBackButton:false,
			hidePasswordInputbox:true,
			hideAppListDropdown:true,
			hideUserNameInputbox:false,
			isForgotPwdHidden:true, 
			hideSignupLink:true,
			hideGoogleLoginBtn:true,
			marginBottomFrgtPassHead:'50px'
		});
		//this.login(event);
		//const resetPasswordUrl= getConfig().kommunicateApi.passwordResetUrl.replace(":userName",this.state.userName);
		/*axios.get(resetPasswordUrl)
		.then(function(response){}).then(response=>{
		console.log("got data afrom server", response)
		}).catch(err=>{
		console.log("err while getting user by email address",err.response);
		})*/
	}

	websiteUrl = (e) => {
		e.preventDefault();
		let websiteUrl = CommonUtils.isKommunicateDashboard() ? getConfig().kommunicateWebsiteUrl : getConfig().applozicWebsiteUrl;
		window.location = websiteUrl;
	}

	checkLoginType = () => {
		return Promise.resolve(getUserInfo(this.state.email, this.state.applicationId))
	}

	showPasswordField = () => {

		if (this.state.hidePasswordInputbox || this.state.googleOAuth) {
			return (
				<div className="input-group mb-4"></div>
			);
		} else {
			return (
				<div className="input-group mb-4">
					<div className="password-input-label-group">
						<input type={this.state.type} className="input" placeholder=" "  onChange = { this.setPassword } value={ this.state.password } onKeyPress={this.onKeyPress} style={{borderColor: this.state.errorInputColor}} required/>
						<label className="label-for-input email-label">Password</label>
						<span className="show-paasword-btn" onClick={this.showHide}>
							{this.state.type === 'input' ? <ShowPasswordIcon /> : <HidePasswordIcon />}
						</span>
					</div>
					<div className="input-error-div" hidden={this.state.hideErrorMessagePassword}>
						<ErrorIcon />
						<p className="input-error-message">{this.state.errorMessageTextPassword}</p>
					</div>
				</div>
			);
		}
	}

	checkLoginTypeWrapper = () => {
		this.checkLoginType().then( response => {
			console.log(response.data.data.loginType);
			if (response.data.data.loginType === 'oauth') {
				this.submitForm()
			} else {
				this.setState({
					googleOAuth: false
				})
			}
		})
	}


  	render() {
		return (
			<div>
				<div className={this.state.googleOAuth?"n-vis":"app flex-row align-items-center login-app-div"}>
					<div className="container">
						<div className="logo-container text-center">
							<a href="#" onClick={this.websiteUrl}>  {CommonUtils.isKommunicateDashboard() ? <KommunicateLogo/> : <ApplozicLogo style={{ width: "auto", height: "55px"}} /> } </a>
						</div>
						<div className="row justify-content-center login-form-div">
							<div className="col-lg-5 col-md-8 col-sm-12 col-xs-12">
								<Hr />
									<div className="card-group mb-0">
										<div className="card p-4 login-card-block">
											<div className="card-block">
												<div className="card-block-login-frgtpass-container" hidden={this.state.isLoginFrgtPassHidden}>
													<h1 className="login-signup-heading text-center" style={{marginBottom: this.state.marginBottomFrgtPassHead}}>{this.state.loginFormText}</h1>
													<p className="setup-sub-heading text-center" hidden={this.state.subHeading}>{this.state.loginFormSubText}</p>

													{/* Login with Google code STARTS here. */}
													{/* To show or hide Login with Google just add "n-vis" to  "signup-with-google-btn" and "or-seperator" class.*/}
													<a className="signup-with-google-btn" hidden={this.state.hideGoogleLoginBtn} href={this.state.googleLoginUrl}>
													<GoogleLogin/>
													Login with Google
													</a>

													<div className="or-seperator" hidden={this.state.hideGoogleLoginBtn}>
														<div className="or-seperator--line"></div>
														<div className="or-seperator--text">OR</div>
													</div>

													{/* Login with Google code ENDS here */}

													<div hidden ={this.state.hideUserNameInputbox}>
														<InputField
															inputType={'email'}
															id={'email-input-field'}
															title={'Email Id'}
															name={'email'}
															onChange={this.setEmail}
															value={this.state.email}
															errorMessage={this.state.errorMessageText}
															hideErrorMessage={this.state.hideErrorMessage}
															required={'required'}
															onBlur ={this.blurHandler} onKeyPress={this.onKeyPress}
															style={{borderColor: this.state.errorInputColor}}/>
													</div>
					
													<div className="input-group mb-4" hidden ={this.state.hideAppListDropdown}>
														{/* <span className="input-group-addon"><i className="icon-user"></i></span> */}
														<DropdownButton title={this.state.dropDownBoxTitle}  id="split-button-pull-right" >
															{
																Object.keys(this.state.appIdList).map(function(key) {
																return <MenuItem key = {key} onClick={() => {
																	this.state.applicationId=key;
																	this.state.applicationName = this.state.appIdList[key];
																	this.setState({"dropDownBoxTitle":key});
																	this.checkLoginTypeWrapper()
																}}>{key}</MenuItem>
																}.bind(this))
															}
														</DropdownButton>
													</div>
													{   /*
														* Just for more better security no need to render the password field.
														* User can just unhide the field if it is hidden it is better just to not render the field.
														*/
														this.showPasswordField()
													}
													<div className="row">
														<div className="col-12 text-right forgot-password-div">
															<button type="button" id ="btn-forgot-password" className="btn btn-link px-0" hidden={this.state.isForgotPwdHidden}  onClick= { this.initiateForgotPassword }>Forgot password?</button>
														</div>
													</div>
													<div className="row">
														<div className="col-12 text-center">
															<Button primary large fontSize={"16px"} id="login-button" type="button" disabled={this.state.loginButtonDisabled} onClick={(event) => this.login(event)}>{this.state.loginButtonText}</Button>
															<p className="have-need-account" hidden={this.state.hideSignupLink}>Don’t have an account? <Link to={'/signup'}>Sign up</Link></p>
														</div> 
													</div>
				
												</div>

												<div className="frgtpass-success-confirmation text-center" hidden={this.state.frgtPassSuccessConfirmation}>
													<p className="text-muted login-signup-sub-heading">{this.state.loginFormSubText}</p>
													<div className="svg-container">
														<ConfirmationTick />
													</div>
													<Button type="button" onClick ={ this.backToLogin }>Login</Button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="text-center" >
								{!this.state.hideBackButton && 
									<button type="button" className="km-button login-back-btn" onClick= { this.backToLogin }>
										<BackButton />
									</button>
								}
							</div>
						<div className="bottom-shape-container"></div>
					</div>
				</div>
				<div className= {this.state.googleOAuth?"vis":"n-vis"} style={{ width:"6em",height: "6em",position: "fixed",top: "50%",left: "calc(50% - 4em)",transform: "translateY(-50%)"}}>
					<img src={kmloadinganimation} style={{width: "6em", height: "6em"}}/> 
				</div>
			</div>
		);
  	}
}

// export default Login;
const mapStateToProps = state => ({
  	userInfo:state.login.userInfo
});
const mapDispatchToProps = dispatch => {
  return {
    saveUserInfo: payload => dispatch(Actions.saveUserInfo(payload)),
    setLogInStatus: payload => dispatch(Actions.updateLogInStatus(payload)),
    setOnBoardingStatus: payload => dispatch(signUpActions.updateOnBoardingStatus(payload))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Login);
