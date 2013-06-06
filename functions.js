// JavaScript Document

var code;
var source;
var console = "";

// Global condition variables
var EQ = false;
var NE = false;
var CS = false;
var CC = false;
var MI = false;
var PL = false;
var VS = false;
var VC = false;
var HI = false;
var LS = false;
var GT = false;
var GE = false;
var LE = false;
var LT = false;

// Global flags for zero, carry, negative, and overflow
var Z = 0;
var C = 0;
var N = 0;
var V = 0;

// Global array representing registers
var R = new Array(10);
for (var i = 0; i < 10; i++) {
	R[i] = new Array(32);
}

// Global array of values from c code
var S = new Array(10);
for (var i = 0; i < 10; i++) {
	S[i] = new Array(5);
}
// Global count of c variables 
var counter = 0;

// Global array representing stack
var stack = new Array(10);
stackCount = 0;

// Global flags marking iterations in main for loop that should be skipped.
// For use with IT blocks when 'else' statements must be skipped. 
// By default, set to -1, a value that 'i' in main for loop will never have.
var skip1 = -1;
var skip2 = -1;

// This function adds the second two parameters and the value in the carry.
// Stores result in first parameter. 
function ADC(Rs, Ra, Rb, s) {
	var sum;
	var a = sVal(Ra);
	var b = sVal(Rb);
	sum = a+b;
	alert(a+' '+b);
	
	var temp = new Array(32);
	getBinary(sum, temp);
	MOV (Rs, temp);

	if (s) {
		var check = sVal(Rs);
		alert(check+' '+sum);
		if (check != sum) {
			V = 1;
			C = 1;
			alert(check+' '+sum);
		}
		setFlags(Rs);
	}
	
	
}


// Calculates sum of second two numbers passed as parameters, stores
// sum in first variable
function ADD(Rs, Ra, Rb, s) {
	var sum;
	var size = Ra.length - 1; 
	var tempC = C; 			// preserve old value of carry
	C = 0;
	
	for (var i = size; i >= 0; i--) {
		sum = Ra[i] + Rb[i] + C;
		C = 0;
		if ( sum >= 2) {
			if (sum == 3) {
					Rs[i] = 1;
			} else {
					Rs[i] = 0;
			}
			C = 1;
			continue;
		} else {
			Rs[i] = sum;
		}
	} 
	//printRegister(Rs);
	if (s) {
		setFlags(Rs);
	} else {
		C = tempC;			// restore old value of carry 
	}
}

// This function AND's the values in Ra and Rb and stores them in Rs
function AND(Rs, Ra, Rb) {
	var temp = new Array(32);
	for (var i = 0; i < 32; i++) {
		Rs[i] = Ra[i] & Rb[i];
	}
}


// This function shifts Ra over x times and places value in Rs. Includes sign extend.
function ASR (Rs, Ra, x, s) {
	var temp = new Array(32);
	var hold = Ra[32-x];			// holds last bit shifted out
	
	// Fill new array with first bit of Ra for sign extension 
	for (var i = 0; i < 32; i++) {
		temp[i] = Ra[0];
	}
	
	for (var i = x; i < 32; i++) {
		temp[i] = Ra[i-x];
	}
	MOV(Rs, temp);
	
	if (s) {
		setFlags(Rs);
		C = hold;
	}
}

// This function AND's the value in Ra with the value of Rb-not and stores result in Rs
function BIC(Rs, Ra, Rb) {
	var temp = new Array(32);
	MOV(temp, Rb);
	NEG(temp, temp);
	
	for (var i = 0; i < 32; i++) {
		Rs[i] = Ra[i] & temp[i];
	}
}

// This function clears specified bits from Rs. It begins at lsb and clears bits
// up to width. Because binary works in little endian, and arrays work in big endian, 
// some initial conversion (subtract LSB from 31) is necessary. 
function BFC(Rs, lsb, width) {
	// Convert lsb from little-endian to big-endian
	lsb = 31 - lsb;
	var sum = parseInt(lsb) - parseInt(width);
	
	// Make sure that width is not zero, and extracted bits do not go out of indeces
	if (width == 0 || sum < -1) {
		console += "Invalid combination of width and lsb. <br/>";
		return 0;
	}
	
	// Clear bits: move in reverse along Rs width times
	for (var i = lsb; i > sum; i--) {
		Rs[i] = 0;
	}
	
}

// This function replaces width bits in Rs, starting from lsb, from Rb. It takes width bits from Rb,
// starting at first bit. 
// As in the above function, some initial conversion is necessary: binary works in little endian, 
// and arrays work in big endian, 
function BFI(Rs, Rb, lsb, width) {
	// Convert lsb from little-endian to big-endian
	lsb = 31 - lsb;
	var sum = parseInt(lsb) - parseInt(width);
	
	// Make sure that width is not zero, and inserted bits will not go out of indeces
	if (width == 0 || sum < -1) {
		console += "Invalid combination of width and lsb. <br/>";
		return 0;
	}
	
	// Copy bits: move in reverse along Rs width times
	var j = 31;
	for (var i = lsb; i > sum; i--) {
		Rs[i] = Rb[j];
		j--;
	}
}

/* This function calculates the binary value of a number and stores it in register 
 *	specified. It does so by first setting all values in said register to zero, then
 *	calling the recursive function calcBinary.
*/
function getBinary(x, V0) {
	var int = false;
	if (V0 == "int") {
		int = true;
		V0 = new Array(32);
	}
	for (var i = 0; i < V0.length; i++) {
		V0[i] = 0;
	}
	
	calcBinary(x, V0, V0.length-1);
	
	if (int) {
		return V0;
	}
}


// This function recursively calculates the binary value of x, and stores it in V0
function calcBinary(x, V0, index) {
	var val = x%2;
	V0[index] = val;
	x /= 2;
	
	if (val) {
		x -= 0.5; 
	} 
	
	if (x) {
		calcBinary(x, V0, --index);
	}

	return;
}

// This function counts the number of leading zeros in Ra and stores binary result in Rs
function CLZ (Rs, Ra) {
	var i = 0;
	var zeros = 0;
	
	// Loop through array until we come across a one. Update zero counter each time.
	while (Ra[i] != 1 ) {
		zeros++;
		i++;
		if (i == 32) { break; }
	}
	
	// Get binary value of zero counter and store in Rs
	getBinary(zeros, Rs);	
}

// This function compares the contents of two registers and returns a code
// for the result.
function CMP(Ra, Rb) {
	// Reset all conditional variables to false
	NE = false;
	CS = false;
	CC = false;
	MI = false;
	PL = false;
	VS = false;
	VC = false;
	HI = false;
	LS = false;
	GT = false;
	GE = false;
	LE = false;
	LT = false;
	GT = false;
	GE = false;
	EQ = false;
	LE = false;
	LT = false;
	
	var Sa = sVal(Ra);			// signed value of Ra
	var Sb = sVal(Rb);			// signed value of Rb
	var Ua = uVal(Ra);			// unsigned value of Ra
	var Ub = uVal(Rb);			// unsigned value of Rb
	
	if (Sa != Sb) {
		NE = true;
	}
	if (C) {
		CS = true;
	} else {
		CC = true;
	}
	if (N) {
		MI = true;
	} else {
		PL = true;
	}
	if (V) {
		VS = true;
	} else {
		VC = true;
	}
	if (Ua > Ub) {
		HI = true;
	}
	if (Ua <= Ub) {
		LS = true;
	}
	if (Sa > Sb) {
		GT = true;
	}
	if (Sa >= Sb) {
		GE = true;
	}
	if (Sa == Sb) {
		EQ = true;
	}
	if (Sa <= Sb) {
		LE = true;
	}
	if (Sa < Sb) {
		LT = true;
	}
	
}

function compCmd(comp) {
	if (comp == "NE") {
		if (NE) { return true; }
		else { return false; }
	} else if (comp == "HI") {
		if (HI) { return true; }
		else { return false; }
	} else if (comp == "LS") {
		if (LS) { return true; }
		else { return false; }
	} else if (comp == "GE") {
		if (GE) { return true; }
		else { return false; }
	} else if (comp == "EQ") {
		if (EQ) { return true; }
		else { return false; }
	} else if (comp == "LE") {
		if (LE) { return true; }
		else { return false; }
	} else if (comp == "LT") {
		if (LT) { return true; }
		else { return false; }
	} else {
		console += "Compare case not understood. <br/>";
	}
}

// This function calculates the unsigned quotient of two binary numbers. It gets the
// unsigned value of each (an integer), divides them, converts the result to binary,
// and stores said result in Rs. 
function DIV(Rs, Ra, Rb) {
	var a = uVal(Ra);
	var b = uVal(Rb);
	var quotient = a/b;
	
	// Take floor of quotient
	quotient = Math.floor(quotient);
	
	// Get binary value of quotient
	quotient = getBinary(quotient, "int");
	
	// Store in specified register
	MOV(Rs, quotient);
	
}

// This function calculates the signed quotient of two binary numbers. It gets the
// signed value of each (an integer), divides them, converts the result to binary,
// and stores said result in Rs. 
function SDIV(Rs, Ra, Rb) {
	var negative = false;
	var a = sVal(Ra);
	var b = sVal(Rb);
	var quotient = a/b;
	
	// Take floor of quotient
	quotient = Math.floor(quotient);
	
	// If quotient is negative, convert to positive for translation to binary
	if (quotient < 0) {
		negative = true;
		quotient *= -1;
	}
	
	// Get binary value of quotient. If negative, convert to two's complement.
	quotient = getBinary(quotient, "int");
	if (negative) {
		twoComp(quotient);
	}
	
	MOV(Rs, quotient);
	
}

// This function calculates the result of an exclusive or between Ra and Rb
// and stores the value in Rs
function EOR(Rs, Ra, Rb) {
	for (var i = 0; i < 32; i++) {
		Rs[i] = Ra[i] ^ Rb[i];
	}
}


// This function loads an unsigned eight bit variable into a register.
function LDRB(Rs, Ra) {
	for (var i = 0; i < 32; i++) {
		Rs[i] = 0;
	}
	
	for (var i = 24; i < 32; i++) {
		Rs[i] = Ra[i];
	}
}

// This function loads an signed eight bit variable into a register.
function LDRSB(Rs, Ra) {
	for (var i = 0; i < 24; i++) {
		Rs[i] = Ra[24];
	}
	
	for (var i = 24; i < 32; i++) {
		Rs[i] = Ra[i];
	}
}

// This function loads a 64-bit variable into two registers
function LDRD(Rs, Rt, Ra) {
	for (var i = 0; i < 32; i++) {
		Rs[i] = Ra[i + 32];				// Rs takes least significant word
		Rt[i] = Ra[i];					// Rt takes most significant word
	}
}

// This function loads an unsigned two byte variable into a register.
function LDRH(Rs, Ra) {
	for (var i = 0; i < 32; i++) {
		Rs[i] = 0;
	}
	
	for (var i = 16; i < 32; i++) {
		Rs[i] = Ra[i];
	}
}

// This function loads a signed sixteen bit variable into a register and sign extends.
function LDRSH(Rs, Ra) {
	for (var i = 0; i < 16; i++) {
		Rs[i] = Ra[16];
	}
	
	for (var i = 16; i < 32; i++) {
		Rs[i] = Ra[i];
	}
}

// This function shifts Ra to the left x times, and stores result in Rs
function LSL(Rs, Ra, x, s) {
	var temp = new Array(32);
	var hold = Ra[x-1];
	
	for (var i = 0; i < 32; i++) {
		temp[i] = 0;
	}
	
	for (var i = 31; i >= 0; i--) {
		temp[i-x] = Ra[i];
	}
	MOV(Rs, temp);
	
	if (s) {
		setFlags(Rs);
		C = hold;
	}
}

// This function shifts Ra to the right x times and places value in Rs. Zero fills. 
function LSR (Rs, Ra, x, s) {
	var temp = new Array(32);
	var hold = Ra[32-x];
	
	// Fill new array with zeros 
	for (var i = 0; i < 32; i++) {
		temp[i] = 0;
	}
	
	for (var i = x; i < 32; i++) {
		temp[i] = Ra[i-x];
	}
	
	MOV(Rs, temp);
	if (s) {
		setFlags(Rs);
		C = hold;
	}
}

// This function adds Rc to the signed product of Ra and Rb and stores result in Rs
function MLA(Rs, Ra, Rb, Rc) {
	var product = new Array(32);
	SMUL(product, Ra, Rb);
	ADD (Rs, product, Rc, 0);
}

// This function subtracts the signed product of Ra and Rb from Rc and stores result in Rs
function MLS(Rs, Ra, Rb, Rc) {
	var product = new Array(32);
	SMUL(product, Ra, Rb);
	SUB (Rs, Rc, product, 0);
}

// This function multiplies Ra and Rb and stores value in Rs
function MUL(Rs, Ra, Rb) {
	if (!Ra) { console+= "Null register. <br/>"; }
	if (!Rb) { console+= "Null register. <br/>"; }
	
	var count = 0;
	var temp = new Array(32);
	for (var i = 0; i < 32; i++) {
		temp[i] = 0;
		Rs[i] = 0;
	}
	
	for (var i = 31; i >= 0; i--) {
		for (var j = 31; j >= 0; j--) {
			if (Ra[j] && Rb[i]) {
				temp[j] = 1;
			} else {
				temp[j] = 0;
			}
		}
		// Shift temp to left i times
		LSL(temp, temp, count, 0);
		ADD(Rs, Rs, temp, 0);
		count++;
	}
	
}


// This function calculates the signed product of two binary numbers. It gets the
// signed value of each (an integer), multiplies them, converts the result to binary,
// and stores said result in Rs. 
function SMUL(Rs, Ra, Rb) {
	var negative = false;
	var a = sVal(Ra);
	var b = sVal(Rb);
	var product = a*b;
	
	if (product < 0) {
		negative = true;
		product *= -1;
	}
	
	product = getBinary(product, "int");
	if (negative) {
		twoComp(product);
	}
	
	MOV(Rs, product);
	
}

// This function copies the value of second parameter into first parameter.
function MOV(Rs, Ra) {
	for (var i = 0; i < 32; i++) {
		Rs[i] = Ra[i];
	}
}

// This function places the Ra-Not in Rs
function MVN(Rs, Ra) {
	NEG(Rs, Ra);
}

// This function calculates the inverse of Rs and places result in Ra
function NEG(Rs, Ra) {
	for (var i = 0; i < 32; i++) {
		Rs[i] = 1^Ra[i];
	}
	
	setFlags(Rs);
}

// This function OR's the values in Ra and Rb and stores them in Rs
function ORR(Rs, Ra, Rb) {
	for (var i = 0; i < 32; i++) {
		Rs[i] = Ra[i] | Rb[i];
	}
}

// This function OR's the values in Ra and Rb and stores them in Rs
function ORN(Rs, Ra, Rb) {
	var temp = new Array(32);
	MOV(temp, Rb);
	NEG(temp, temp);
	
	for (var i = 0; i < 32; i++) {
		Rs[i] = Ra[i] | temp[i];
	}
}

// This function prints the binary contents of specified register
function printRegister(Reg) {
	if (Reg[0] == undefined) {
		console+="Register undefined. <br />";
		return;
	}
	for (var i = 0; i < Reg.length; i++) {
		console += (Reg[i]);
	}
	console+= "<br/>";
}

function printFlags() {
	console += "N: "+N+" Z: "+Z+" C: "+C+" V: "+V+"<br/>";
}


// This function pops a register from the bottom of the stack
function POP(Ra) {	
	var temp = new Array(32);
	// Place bottom-most value in stack in temp
	temp = stack[stackCount-1];
	// Copy that value to Ra
	MOV(Ra, temp);	
	// Decrement count of items in stack
	stackCount--;
}

// This function pushes a register to the bottom of the stack
function PUSH(Ra) {
	var temp = new Array(32);
	
	// Copy Ra to a temporary variable - otherwise, any future changes to Ra would affect
	// copy in stack, because JavaScript passes by reference.
	MOV (temp, Ra);
	
	// Place temp at bottom of stack
	stack[stackCount] = temp;
	
	// Increment stack count
	stackCount++;	
}

// This function reverses the bit order of Ra and stores result in Rs
function RBIT (Rs, Ra) {
	MOV(Rs, Ra);		// Copy Ra to Rs
	Rs.reverse();		// Reverse bit order of Rs
}

// This function reverses the byte order of Ra and stores result in Rs
function REV(Rs, Ra) {
	var temp = new Array(32);
	// Copy most and least significant bytes onto opposite ends of temporary array
	for (var i = 0; i < 8; i++) {
		temp[i] = Ra[i + 24];
		temp[i + 24] = Ra[i];
	}
	// Switch middle bytes
	for (var i = 8; i < 16; i++) {
		temp[i] = Ra[i + 8];
		temp[i+8] = Ra[i];
	}
	MOV(Rs, temp);
}

// This function switches the half words
function REV16(Rs, Ra) {
	var temp = new Array(32);
	for (var i = 0; i < 16; i++) {
		temp[i] = Ra[i + 16];
		temp[i + 16] = Ra[i];
	}
	MOV(Rs, temp);
	
}

// This function rotates the bits in Ra to the right by x places and puts the shifted
// bits in the vacated indeces. 
function ROR(Rs, Ra, x) {
	var temp = new Array(32);
	
	// Rotate Ra to right by x bits, store result in temp
	LSR(temp, Ra, x, 0);
	
	// Fill first x bits with last x bits of Ra
	for (var i = 0; i < x; i++) {
		temp[i] = Ra[(32-x)+i];
		//temp[i] = 7;
	}
	
	MOV(Rs, temp);
}

// This function subtracts Ra from Rb (the opposite of the regular SUB function) and stores
// result in Rs
function RSB(Rs, Ra, Rb, s) {
	var negative = false;
	
	var a = sVal (Ra);
	var b = sVal (Rb);
	var dif = b - a;
	
	if (dif < 0) {
		negative = true;
		dif *= -1;
	}
	
	getBinary(dif, Rs);
	if (negative) {
		twoComp(Rs);
		dif *= -1;				// convert back to negative for accurate comparison if s is true
	}
	
	if (s) {
		var check = sVal(Rs);
		if (check != dif) {
			C = 1;
			V = 1;
		}
		setFlags(Rs);
	}
	
}

// This function stores the signed 64-bit product of two registers in Rs
function SMULL(Rs, Rt, Ra, Rb) {
	var temp = new Array(64);
	var negative = false;
	
	// Get signed values of Ra and Rb
	var a = sVal(Ra);
	var b = sVal(Rb);
	
	// Multiply together to get product
	var product = a*b;
	
	// If product is negative, update flag and convert to positive
	if (product < 0) {
		negative = true;
		product *= -1;
	}
	
	// Convert product to 64-bit binary value
	getBinary(product, temp);
	if (negative) {
		twoComp(temp);
	}
	
	// Place least significant 32 bits in Rs
	MOV(Rs, temp.slice(32, 64));
	
	// Place most significant 32 bits in Rt
	MOV(Rt, temp.slice(0, 32));
}

// This function stores the signed 64-bit product of two registers in Rs. Has yet to be completed. 
function SMLAL(Rs, Rt, Ra, Rb) {
	var temp = new Array(64);
	var negative = false;
	
	// Get signed values of Ra and Rb
	var a = sVal(Ra);
	var b = sVal(Rb);
	
	// Multiply together to get product
	var product = a*b;
	
	// If product is negative, update flag and convert to positive
	if (product < 0) {
		negative = true;
		product *= -1;
	}
	
	// Convert product to 64-bit binary value
	getBinary(product, temp);
	if (negative) {
		twoComp(temp);
	}
	
	MOV(Rs, temp.slice(32, 64));
	MOV(Rt, temp.slice(0, 32));
}


// This function subtracts Rb from Ra and places result in Rs. It works by
// taking the two's complement of Rb and adding it to Ra. 
function SUB(Rs, Ra, Rb, s) {	
	var negative = false;
	var a = sVal(Ra);
	var b = sVal(Rb);
	var result = a-b;
	
	if (result < 0) {
		negative = true;
		result *= -1;
	}
	
	getBinary(result, Rs);
	if (negative) {
		twoComp(Rs);
		result *= -1;			// convert back to negative for comparing below
	}
	
	if (s) {
		var check = sVal(Rs);
		if (check != result) {
			C = 1;
			V = 1;
		}
		setFlags(Rs);
	}
}

// This function sign-extends a signed byte
function SXTB(Rs, Ra) {
	var temp = new Array(32);
 
	// Fill array with sign of Ra
	for (var i = 0; i < 32; i++) {
		temp[i] = Ra[24];
	}
	
	// Copy value in Ra to temp
	for (var i = 24; i < 32; i++) {
		temp[i] = Ra[i];
	}
	
	// Copy temp to Rs
	MOV(Rs, temp);
}

// This function sign-extends a signed half-word
function SXTH(Rs, Ra) {
	var temp = new Array(32);
	
	// Fill array with sign of Ra
	for (var i = 0; i < 32; i++) {
		temp[i] = Ra[16];
	}
	
	// Copy half-word in Ra to temp
	for (var i = 16; i < 32; i++) {
		temp[i] = Ra[i];
	}
	
	// Copy temp to register where it'll be permanently stored
	MOV(Rs, temp);
}

// This function stores the unsigned 64-bit product of two registers in Rs
function UMULL(Rs, Rt, Ra, Rb) {
	var temp = new Array(64);
	
	// Get unsigned values of Ra and Rb
	var a = uVal(Ra);
	var b = uVal(Rb);
	
	// Multiply together to get product
	var product = a*b;
	
	// Convert product to 64-bit binary value
	getBinary(product, temp);

	// Place least significant 32 bits in Rs
	MOV(Rs, temp.slice(32, 64));
	
	// Place most significant 32 bits in Rt
	MOV(Rt, temp.slice(0, 32));
}

// This function zero-extends a byte
function UXTB(Rs, Ra) {
	var temp = new Array(32);
 
	// Fill array with sign of Ra
	for (var i = 0; i < 32; i++) {
		temp[i] = 0;
	}
	
	// Copy value in Ra to temp
	for (var i = 24; i < 32; i++) {
		temp[i] = Ra[i];
	}
	
	// Copy temp to Rs
	MOV(Rs, temp);
}

// This function zero-extends a half-word
function UXTH(Rs, Ra) {
	var temp = new Array(32);
	
	// Fill array with sign of Ra
	for (var i = 0; i < 32; i++) {
		temp[i] = 0;
	}
	
	// Copy half-word in Ra to temp
	for (var i = 16; i < 32; i++) {
		temp[i] = Ra[i];
	}
	
	// Copy temp to register where it'll be permanently stored
	MOV(Rs, temp);
}

// This function takes a value and turns it into its two's complement.
// Coded by Aaron Chung (kind of)
function twoComp(V0) {
	var size = V0.length;
	var V1 = new Array(size);
	
	for (var i = 0; i < size; i++) {
		V1[i] = 0;
	}

	// negate all values in array
	for (var i = 0; i < size; i++) {
		V0[i] ^= 1;
	}
	
	// add 1 to V0
	getBinary(1, V1);
	ADD(V0, V0, V1, 0);
}

function clearFlags() {
	N = 0;
	Z = 0;
	C = 0;
	V = 0;	
}

// This function calculates the signed value of the variable passed
// as a parameter. 
function sVal(Ra) {
	
	var power = Ra.length-1;
	var size = power+1;

	var val = Ra[0]*Math.pow(2,power);
	
	for (var j = 1; j < size; j++) {
		power--;
		val -= Ra[j]*Math.pow(2,power);	
	}
	val *= -1;

	return val;
}



// This function calculates the unsigned value of the variable passed
// as a parameter and prints it to console.
function uVal(Ra) {
	var val = 0;
	var power = 0;
	
	for (var i = 31; i >= 0; i--) {
		val += Ra[i]*Math.pow(2,power);
		power++;
	}

	return val;
}


function getVal(Ra) {	
	var temp = new Array(32);
	var negative = false;
	if (Ra.charAt(0) == '#' || Ra.charAt(0) == '=') {
		var num = "";
		var i;
		if (Ra.charAt(1) == '-') {
			i = 2;
			negative = true;
		} else {
			i = 1;
		}
		while (Ra.charAt(i)) {
			num += Ra.charAt(i);
			i++;
		}
		getBinary(num, temp);
		if (negative) {
			twoComp(temp);
		}
		return temp;
	} else if (Ra.charAt(0) == 'R') {
		var a1 = Ra.charAt(1);
		return R[a1];
	} else {
		console += "Something went horribly wrong =[ </br>And it's your fault.. >=[ </br>";
		return false;
	}
	
}

// This function is for loading a value into a register. It checks to see if another register,
// a number, or a C variable has been specified. Someday, it might check for addresses.
function loadVal(Ra) {
	var temp = new Array(32);
	var negative = false;
	if (Ra.charAt(0) == '#') {
		console += "Use '=' signs in load statements, not '#' signs!";
		return false;
	}
	if (Ra.charAt(0) == '=') {
		var num = "";
		var i;
		if (Ra.charAt(1) == '-') {
			i = 2;
			negative = true;
		} else {
			i = 1;
		}
		while (Ra.charAt(i)) {
			num += Ra.charAt(i);
			i++;
		}
		getBinary(num, temp);
		if (negative) {
			twoComp(temp);
		}
		return temp;
	} else if (Ra.charAt(0) == 'R') {
		var a1 = Ra.charAt(1);
		return R[a1];
	} else {
		// Check to see if C identifier has been stated
		for (var i = 0; i < counter; i++) {
			if (Ra == S[i][0]) {
				return S[i][1];
			}
		}
		
		console += "We can't find what you're looking for =[ </br>";
		return false;
	}
}

function printStack() {
	console += "------------------------ Stack ----------------------------- <br/>";
	for (var i = 0; i < stackCount; i++) {
		printRegister(stack[i]);	
	}
	console += "------------------------------------------------------------ <br/>";
}

function setFlags(Rs) {
	// If result is 0, update zero flag 
	if (uVal(Rs) == 0) {
		Z = 1;
	} else {
		Z = 0;
	}
	
	// Update negative flag: if MSB is 1, N is set to 1
	N = Rs[0];
}

/*
printRegister(R0);
printRegister(R1);*/
//ADD(R0, R0, R1);
//printRegister(R0);
