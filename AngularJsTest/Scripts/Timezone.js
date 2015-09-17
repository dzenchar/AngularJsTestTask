angular.module('timeZone', [])
    .directive('cityautocomplete', ['$http', function ($http) {
        return {
            link: function(scope, element, attrs) {
                $(element).typeahead({
                    source: function(q, cb) {
                        $http.get('//maps.googleapis.com/maps/api/geocode/json', {
                            params: {
                                address: q,
                                sensor: false
                            }
                        }).then(function (response) {
                            var addresses = [];

                            response.data.results.map(function (item) {
                                addresses.push(item.formatted_address);
                            });

                            cb(addresses);
                        });
                    },
                    updater: function(item) {
                        return item;
                    }
                });
            }
        };
    }])
    .controller('TimeZoneController', ['$scope', '$filter', function($scope, $filter) {
        var me = this;
        me.timeZones = [];
        me.isEditState = false;
        me.editingZone = null;

        var calcOffsetTime = function () {
            var now = new Date();
            var gmt = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
            gmt.setHours(gmt.getHours() + parseInt(this.timeZone));
            return $filter('date')(gmt, 'HH:mm:ss');
        };

        setInterval(function () {
            $scope.$apply();
        }, 1000);

        me.addZone = function() {
            var value = { timeZone: me.timeZoneValue, city: me.cityValue };
            value.timeStr = angular.bind(value, calcOffsetTime);
            me.timeZones.push(value);
            me.reset();
        };

        me.editZone = function(zone) {
            me.editingZone = zone;
            me.timeZoneValue = zone.timeZone;
            me.cityValue = zone.city;
            me.isEditState = true;
        };

        me.cancelEdit = function() {
            me.editingZone = null;
            me.reset();
            me.isEditState = false;
        };

        me.saveZone = function() {
            me.editingZone.timeZone = me.timeZoneValue;
            me.editingZone.city = me.cityValue;
            me.editingZone = null;
            me.isEditState = false;
            me.reset();
        };

        me.deleteZone = function(zone) {
            var idx = me.timeZones.indexOf(zone);
            me.timeZones.splice(idx, 1);
        };

        me.reset = function() {
            me.timeZoneValue = '';
            me.cityValue = '';
        };
    }]);