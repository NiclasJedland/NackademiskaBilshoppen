let BidModule = angular.module('BidModule', []);

BidModule.factory("BidModule", BidModule);

AccountModule.service("BidService", ['$http', '$q', function ($http, $q) {
	let service = {
		getBids: getBids,
		insertBid: insertBid,
	}
	return service;

	function getBids() {
		return $http.get("http://nackademiskabilshopen.azurewebsites.net/api/Bids/");
	}

	function insertBid(bid) {
		let def = $q.defer();
		let settings = {
			method: "POST",
			url: "http://nackademiskabilshopen.azurewebsites.net/api/Bids",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: "Bearer " + localStorage.getItem("token")
			},
			data: bid
		}
		$.ajax(settings).done(function (response) {
			showMessage("Bid successful");			
			def.resolve(response.data);
		})
			.fail(function (response) {
				showErrorMessage("Something went wrong when trying to bid.");
				console.log("Login Error: " + response);
			});
		return def.promise;
	};
}]);