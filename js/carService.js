let CarModule = angular.module('CarModule', []);

CarModule.factory("CarModule", CarModule);
CarModule.$inject = ['$http', '$q'];

AccountModule.service("CarService", ['$http', '$q', function ($http, $q) {
	let service = {
		getCars: getCars,
		getCarById: getCarById,
		createCar: createCar,
		updateCar: updateCar,
		getBidsOnCar: getBidsOnCar,
	}
	return service;

	function getCars() {
		return $http.get("http://nackademiskabilshopen.azurewebsites.net/api/Cars/");
	}

	function getCarById(carId) {
		return $http.get("http://nackademiskabilshopen.azurewebsites.net/api/Cars/" + carId);
	}

	function getBidsOnCar(carId) {
		return $http.get("http://nackademiskabilshopen.azurewebsites.net/api/Cars/" + carId + "/Bids/");
	}

	function createCar(car) {
		car.sellerId = localStorage.getItem("userId");
		let def = $q.defer();
		let settings = {
			method: "POST",
			url: "http://nackademiskabilshopen.azurewebsites.net/api/Cars/",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: "Bearer " + localStorage.getItem("token")
			},
			data: car
		}
		$.ajax(settings).done(function (response) {
				showMessage("Create car successful");
				def.resolve(response.data);
			})
			.fail(function (response) {
				showErrorMessage("Something went wrong when trying to create the car.");
				console.log("Create car Error: " + response);
			});
		return def.promise;
	};

	function updateCar(car) {
		let def = $q.defer();
		let settings = {
			method: "PUT",
			url: "http://nackademiskabilshopen.azurewebsites.net/api/Cars/" + car.id,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: "Bearer " + localStorage.getItem("token")
			},
			data: car
		}
		$.ajax(settings).done(function (response) {
				showMessage("Update car successful");
				def.resolve(response.data);
			})
			.fail(function (response, error) {
				showErrorMessage("Something went wrong when trying to update the car.");
				console.log("Update car Error: " + error.Message);
			});
		return def.promise;
	};
}]);