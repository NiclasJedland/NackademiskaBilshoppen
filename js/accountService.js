let AccountModule = angular.module('AccountModule', []);

AccountModule.factory("AccountModule", AccountModule);

AccountModule.service("AccountService", ['$rootScope', '$http', '$q',
	function ($rootScope, $http, $q) {
		let service = {
			registerUser: registerUser,
			getRoles: getRoles,
			getRoleById: getRoleById,
			login: login,
			logout: logout
		}
		return service;

		function registerUser(user) {
			return $http.post("http://nackademiskabilshopen.azurewebsites.net/api/Account/Register/",
				JSON.stringify(user), {
					"Content-Type": "application/x-www-form-urlencoded",
				});
		};

		function getRoles() {
			return $http.get("http://nackademiskabilshopen.azurewebsites.net/api/Roles/");
		};

		function getRoleById(roleId) {
			return $http.get("http://nackademiskabilshopen.azurewebsites.net/api/Roles/" + roleId);
		};

		function login(user) {
			user.grant_type = "password";
			let def = $q.defer();
			let settings = {
				method: "POST",
				url: "http://nackademiskabilshopen.azurewebsites.net/Token",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				data: user
			}
			$.ajax(settings).done(function (response) {
					localStorage.setItem("token", response.access_token);
					localStorage.setItem("userId", response.userId);
					localStorage.setItem("role", response.roles);
					localStorage.setItem("username", response.userName);

					$rootScope.isLoggedIn = checkIfLoggedIn();
					$rootScope.isAdmin = checkIfAdmin();
					$rootScope.userId = getUserId();
					$rootScope.username = getUsername();

					showMessage("Login Successful");

					def.resolve(response.data);
				})
				.fail(function (response) {
					showErrorMessage("Wrong password or username doesn't exist.");
					console.log("Login Error: " + response);
				});
			return def.promise;
		};

		function logout() {
			let def = $q.defer();
			let settings = {
				method: "POST",
				url: "http://nackademiskabilshopen.azurewebsites.net/api/Account/Logout/",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: "Bearer " + localStorage.getItem("token")
				},
				data: {}
			}
			$.ajax(settings).done(function (response) {
					localStorage.removeItem("token");
					localStorage.removeItem("userId");
					localStorage.removeItem("role");
					localStorage.removeItem("username");

					$rootScope.isLoggedIn = checkIfLoggedIn();
					$rootScope.isAdmin = checkIfAdmin();
					$rootScope.userId = getUserId();
					$rootScope.username = getUsername();

					showMessage("Logout Successful");

					def.resolve(response.data);
				})
				.fail(function (response) {
					showErrorMessage("Something went wrong when trying to logout!");
					console.log("Logout Error: " + response);
				});
			return def.promise;
		};
	}
]);