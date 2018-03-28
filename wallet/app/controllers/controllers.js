app.controller('CreateController', ['$scope', '$location', 'Storage', function($scope, $location, Storage) {
    $scope.mnemonic = window.eztz.crypto.generateMnemonic();
    $scope.password = '';
    $scope.password2 = '';
    $scope.cancel = function(){
        $location.path('/new');
    };
    $scope.create = function(){
        if (!$scope.password || !$scope.password2){
            alert("Please enter your password");
            return;
        }
        if ($scope.password.length < 8){
            alert("Your password is too short");
            return;
        }
        if ($scope.password != $scope.password2){
            alert("Passwords do not match");
            return;
        }
        window.showLoader();
        var identity = {
            temp : {
                mnemonic : $scope.mnemonic,
                password : $scope.password,
            },
            encryptedMnemonic : sjcl.encrypt($scope.password, $scope.mnemonic),
            accounts : [],
        };
        //Create free initial 
        var keys = window.eztz.crypto.generateKeys(identity.temp.mnemonic, identity.temp.password);
        window.eztz.rpc.freeAccount(keys).then(function(r){
          $scope.$apply(function(){
            identity.accounts.push({
              title : 'Account 1',
              pkh : r
            });
            Storage.setStore(identity);
            $location.path('/main');
            $scope.refresh();
          });
        }).catch(function(e){
          window.hideLoader();
          alert("Error");
        });;
    };
}])
.controller('MainController', ['$scope', '$location', '$http', 'Storage', function($scope, $location, $http, Storage) {
    var ss = Storage.loadStore();
    if (!ss || !ss.encryptedMnemonic){
      //not set or not unlocked
         $location.path('/new');
    }
    
    $scope.accounts = ss.accounts;
    $scope.account = ss.accounts[0];
    $scope.accountDetails = {};
    $scope.tt = $scope.account.title;
    
    $scope.lock = function(){
        ss.temp = {};
        Storage.setStore(ss);
        $location.path('/unlock');
    }
    
    var updateActive = function(){
      ss.account = {
        balance : $scope.accountDetails.balance,
        title : $scope.account.title,
        tz1 : $scope.account.pkh,
      }
      Storage.setStore(ss);
    }
    
    $scope.saveTitle = function(){
        if (!$scope.tt){
            alert("Please enter a new title");
            return;
        }
        var i = $scope.accounts.indexOf($scope.account);
        $scope.account.title = $scope.tt;
        $scope.accounts[i] = $scope.account;
        ss.accounts = $scope.accounts;
        Storage.setStore(ss);
        $scope.refresh();
    };
    $scope.remove = function(){
      if (confirm("Are you sure you want to proceed with removing this account?")){
        var i = $scope.accounts.indexOf($scope.account);
        $scope.accounts.splice(i, 1);
        $scope.account = $scope.accounts[0];
        $scope.refresh();
      }
    };
    $scope.add = function(){
      var keys = window.eztz.crypto.generateKeys(ss.temp.mnemonic, ss.temp.password);
      window.showLoader();
      window.eztz.rpc.freeAccount(keys).then(function(r){
        $scope.$apply(function(){
          var i = $scope.accounts.length + 1;
          var an = "Account " + i;
          $scope.account = {
            title : an,
            pkh : r
          };
          $scope.accounts.push($scope.account);
          ss.accounts = $scope.accounts;
          Storage.setStore(ss);
          $scope.refresh();
        });
      });
    };
    $scope.loadAccount = function(a){
        $scope.account = a;
        $scope.tt = a.title;
        $scope.accountDetails = {
            balance : "Loading...",
            usd : "Loading...",
        };
        window.showLoader();
        window.eztz.rpc.getBalance(a.pkh).then(function(r){
            var bal = window.eztz.utility.mintotz(r);
            $scope.accountDetails.balance = window.eztz.utility.formatMoney(bal, 6, '.', ',')+"ꜩ";
            var usdbal = bal * 1.78;
            $scope.accountDetails.usd = "$"+window.eztz.utility.formatMoney(usdbal, 2, '.', ',')+"USD";
            updateActive();
            window.eztz.rpc.getDelegate($scope.account.pkh).then(function(r){
              window.hideLoader();
              $scope.dd = r.delegate;
              if ($scope.dd == 'tz1TwYbKYYJxw7AyubY4A9BUm2BMCPq7moaC' || $scope.dd == 'tz1UsgSSdRwwhYrqq7iVp2jMbYvNsGbWTozp'){
                $scope.delegateType = $scope.dd;
              }
              $scope.$apply(function(){});
            }).catch(function(e){
              window.hideLoader();
               $scope.dd = '';
               $scope.delegateType = '';
               $scope.$apply(function(){});
            });
        });
        updateActive();
        setTimeout(function(){
        window.jdenticon();
        }, 100);
    }
    $scope.refresh = function(){
        $scope.loadAccount($scope.account);
    };
    $scope.copy = function(){
        copyToClipboard($scope.account.pkh);
        alert("The address has been copied");
    };
    $scope.send = function(){
        if (!$scope.amount || !$scope.amount) {
          alert("Please enter amount and a destination");
          return;
        }
        var keys = window.eztz.crypto.generateKeys(ss.temp.mnemonic, ss.temp.password);
        keys.pkh = $scope.account.pkh;
        var operation = {
          "kind": "transaction",
          "amount": window.eztz.utility.tztomin(parseFloat($scope.amount)),
          "destination": $scope.toaddress,
        };
        if ($scope.parameters){
          operation.parameters = window.eztz.utility.sexp2mic($scope.parameters);
        }
        window.showLoader();
        window.eztz.rpc.sendOperation(operation, keys, ($scope.fee ? window.eztz.utility.tztomin(parseFloat($scope.fee)) : 0)).then($scope.endPayment);
    }
    $scope.endPayment = function(r){
        window.hideLoader();
        $scope.$apply(function(){
          if (typeof r.injectedOperation != 'undefined'){
            $scope.clear();
            alert("Operation Sent");
          } else {
            alert("Operation Failed!");
          }
        });
    }
    $scope.clear = function(){
      $scope.amount = 0;
      $scope.fee = 0;
      $scope.toaddress = '';
      $scope.parameters = '';
    }
    $scope.clear();

    $scope.delegateType = '';
    $scope.dd = '';

    $scope.updateDelegate = function(){
        if ($scope.delegateType) $scope.dd = $scope.delegateType;
        if (!$scope.dd) {
          alert("Please enter or a valid delegate");
          return;
        }
        window.eztz.node.setDebugMode(true);
        var keys = window.eztz.crypto.generateKeys(ss.temp.mnemonic, ss.temp.password);
        keys.pkh = $scope.account.pkh;
        window.showLoader();
        window.eztz.rpc.setDelegate(keys, $scope.account.pkh, $scope.dd, 0).then($scope.endDelegate);
    }
    $scope.endDelegate = function(r){
        window.hideLoader();
        $scope.$apply(function(){
          if (typeof r.injectedOperation != 'undefined'){
            $scope.clear();
            alert("Operation Sent");
          } else {
            alert("Operation Failed!");
          }
        });
    }

    $scope.refresh();
    copyToClipboard = function(text) {
        if (window.clipboardData && window.clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            return clipboardData.setData("Text", text); 

        } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            var textarea = document.createElement("textarea");
            textarea.textContent = text;
            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy");  // Security exception may be thrown by some browsers.
            } catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }}
}])
.controller('NewController', ['$scope', '$location', 'Storage', function($scope, $location, Storage) {
    var ss = Storage.loadStore();
    if (ss && typeof ss.temp != 'undefined' && ss.temp.mnemonic && ss.temp.password){
        $location.path('/main');
    }  else if (ss && ss.encryptedMnemonic){
        $location.path('/unlock');
    }
    $scope.restore = function(){
        $location.path('/restore');
    };
    $scope.create = function(){
        $location.path('/create');
    };
    
}])
.controller('UnlockController', ['$scope', '$location', 'Storage', function($scope, $location, Storage) {
    var ss = Storage.loadStore();
    if (!ss || !ss.encryptedMnemonic){
         $location.path('/new');
    }
    $scope.clear = function(){
        if (confirm("Are you sure you want to clear you TezBox - note, unless you've backed up your seed words you'll no longer have access to your accounts")){
        Storage.clearStore();
         $location.path('/new');
        }
    }
    $scope.unlock = function(){
        if (!$scope.password){
            alert("Please enter your password");
            return;
        }
        if ($scope.password.length < 8){
            alert("Your password is too short");
            return;
        }
        try {
            var mnemonic = sjcl.decrypt($scope.password, ss.encryptedMnemonic);
        } catch(err){
            console.log(err);
           alert("Incorrect password");
            return;
        }
        var identity = {
            temp : {
                mnemonic : mnemonic,
                password : $scope.password,
            },
            encryptedMnemonic : ss.encryptedMnemonic,
            accounts : ss.accounts,
        };
        Storage.setStore(identity);
        $location.path('/main');
    };
}])
.controller('RestoreController', ['$scope', '$location', function($scope, $location) {
    $scope.cancel = function(){
        $location.path('/new');
    };
    $scope.restore = function(){
        //Load up things here
    };
}])
;
