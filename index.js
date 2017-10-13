const BN              = require('bignumber.js');
BN.config({ MODULO_MODE: BN.EUCLID });
const CryptoJS        = require('crypto-js');
const S               = require('string');
const BNJS            = require('bn.js');


function main(maxAttempts) {
  maxAttempts = maxAttempts || 100; //1000 * 1000;

  var point = {
    x: new BN(1),
    y: new BN(2)
  };
  var curveOrder = new BN("21888242871839275222246405745257275088548364400416034343698204186575808495617");

  var sha3_256  = function(message) { return CryptoJS.SHA3(message, { outputLength: 256 }) };
  var pointWordArray      = CryptoJS.enc.Hex.parse(point2hex(point));
  var pointHashWordArray  = sha3_256(pointWordArray); // keccak256
  var pointHashScalar     = new BN( '0x' + CryptoJS.enc.Hex.stringify(pointHashWordArray) );
  pointHashScalar = pointHashScalar.mod(curveOrder);

  var x, y, found = false;
  for(var i=0; i < maxAttempts; ++i){
    x   = pointHashScalar.add(i).mod(curveOrder);
    var y2  = x.pow(3, curveOrder).add(3).mod(curveOrder);
    // y   = y2.sqrt(); // this is incorrect way of finding square root
    x           = new BNJS(x.toString(16), 16);
    y2           = new BNJS(y2.toString(16), 16);
    curveOrder  = new BNJS(curveOrder.toString(16), 16);
    y = x.pow(
      curveOrder.add(new BNJS(1)).div(new BNJS(4))
    ).mod(curveOrder);
    // x^((field modulus + 1)/4)
    if (y.pow(2, curveOrder).eq(y2)) {
      found = true;
      console.log('pointHash found in ' + (i+1) + ' attempts.');
      break;
    } else {
      if (i < 100) {
        console.log("y2=", y2.toString(10));
        console.log("y.pow(2)=", y.pow(2, curveOrder).toString(10));
      }
    }
  }
  if (!found) {
    throw new Error("pointHash was not found in " + maxAttempts + ".");
  }
}

function point2hex(point){
  var pointHex_x               = S(point.x.toString(16)).padLeft(64, '0').s; // 64 char hex == 32 bytes
  var pointHex_y               = S(point.y.toString(16)).padLeft(64, '0').s; // 64 char hex == 32 bytes

  return pointHex_x + pointHex_y;
}

main(1000);
