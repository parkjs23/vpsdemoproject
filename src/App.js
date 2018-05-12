import React, { Component } from "react";
import axios from "axios";
import _ from "lodash";
import "./App.css";
import REQUEST_STATUSES from "./requestStatuses";
import STATIC_MESSAGES from "./staticMessages";
export default class App extends Component {
	constructor(props) {
		document.body.style.backgroundColor = '#D5F5E3';
		super(props);

		this.getToken = this.getToken.bind(this);
		this.getDevices = this.getDevices.bind(this);

		this.state = {
			loginStatus: REQUEST_STATUSES.UNINITIALIZED,
			deviceStatus: REQUEST_STATUSES.UNINITIALIZED,
			loginErrorMsg: "",
			token: "",
			devices: []
		};
	}

	componentDidMount() {
		this.getToken();
	}

	getToken() {
		this.setState({ loginStatus: REQUEST_STATUSES.REQUESTED });

		axios({
			method: "post",
			url: "http://demo-staging.virtualpowersystems.com:9001/v3/sessions",
			data: {
				"username": "testuser@vpsi.io",
				"password": "testUser1*"
			}
		})
		.then(response => {
			const token = _.get(response, "data.token", "");

			this.setState({
				token,
				loginStatus: REQUEST_STATUSES.RESOLVED,
				loginErrorMsg: token ? "" : STATIC_MESSAGES.LOGIN_ERRORS.UNKNOWN
			});

			this.getDevices();
		})
		.catch(error => {
			const {
				response: {
					status
				}
			} = error;
			this.setState({
				loginStatus: REQUEST_STATUSES.RESOLVED,
				loginErrorMsg: _.get(STATIC_MESSAGES.LOGIN_ERRORS, status, STATIC_MESSAGES.LOGIN_ERRORS.UNKNOWN)
			});
		});
	}

	getDevices() {
		this.setState({
			deviceStatus: REQUEST_STATUSES.REQUESTED
		});

		axios({
			method: "get",
			url: "http://demo-staging.virtualpowersystems.com:9001/v3/catalog/device",
			headers: {
				Token: this.state.token
			}
		})
		.then(response => {
			const devices = _.get(response, "data", []);
			this.setState({
				devices,
				deviceStatus: REQUEST_STATUSES.RESOLVED
			});
		})
		.catch(error => {
			this.setState({
				deviceStatus: REQUEST_STATUSES.RESOLVED
			});
		});
	}

	renderDevices() {
		const { devices, deviceStatus } = this.state;

		switch (deviceStatus) {
			case REQUEST_STATUSES.REQUESTED:
				return <div>Requesting device data...</div>;
			case REQUEST_STATUSES.RESOLVED:
				return devices.map((device, i) => <div key={`device-${i}`}>{device.completeName}</div>);
			default:
				return <div>An unknown error has occured...</div>;
		}
	}

	renderContent() {
		if(!this.state.token) {
			return <div>Logging in...</div>;
		}

		return this.renderDevices();
	}

	render() {
		return (
			<div className="App">
				<h1>Virtual Power Systems Demo App</h1>
				<div className="Content">
					{this.renderContent()}
				</div>
			</div>
		);
	}
}
