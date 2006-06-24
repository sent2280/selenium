/*
 * Format for Selenium Remote Control Java client.
 */

load('remoteControl.js');

this.name = "java-rc";
this.useSeparateEqualsForArray = true;

function formatHeader(testCase) {
	var className = testCase.name;
	if (!className) {
		className = "NewTest";
	}
	var formatLocal = testCase.formatLocal(this.name);
	if (!formatLocal.packageName) {
		formatLocal.packageName = options.packageName;
	}
	var methodName = className;
	methodName = methodName.replace(/Test$/, "");
	methodName = methodName.replace(/^Test/, "");
	methodName = "test" + methodName;
	var header = "";
	if (formatLocal.packageName) {
		header += "package " + formatLocal.packageName + ";\n\n";
	}
	header +=
		"import com.thoughtworks.selenium.*;\n" +
		"import java.util.regex.Pattern;\n" +
		"\n" +
        "public class " + className + " extends " + options.superClass + " {\n" + 
        "\tpublic void " + methodName + "() throws Exception {\n";
	this.lastIndent = "\t\t";
	this.header = header;
	return header;
}

function formatFooter(testCase) {
	var footer = 
		"\t\tcheckForVerificationErrors();\n" +
		"\t}\n" +
		"}\n";
	this.footer = footer;
	return footer;
}

function assertTrue(expression) {
	return "assertTrue(" + expression.toString() + ");";
}

function verifyTrue(expression) {
	//return "verifyTrue(" + expression.toString() + ");";
	return "assertTrue(" + expression.toString() + ");";
}

function assertFalse(expression) {
	return "assertFalse(" + expression.toString() + ");";
}

function verifyFalse(expression) {
	//return "verifyFalse(" + expression.toString() + ");";
	return "assertFalse(" + expression.toString() + ");";
}

function assignToVariable(type, variable, expression) {
	return type + " " + variable + " = " + expression.toString();
}

function waitFor(expression) {
	return "for (int second = 0;; second++) {\n" +
		"\tif (second >= 60) fail(\"timeout\");\n" +
		"\ttry { " + (expression.setup ? expression.setup() + " " : "") +
		"if (" + expression.toString() + ") break; } catch (Exception e) {}\n" +
		"\tThread.sleep(1000);\n" +
		"}\n";
	//return "while (" + not(expression).toString() + ") { Thread.sleep(1000); }";
}

function assertOrVerifyFailure(line, isAssert) {
	var message = '"expected failure"';
	var failStatement = isAssert ? "fail(" + message  + ");" : 
		"verificationErrors.append(" + message + ");";
	return "try { " + line + " " + failStatement + " } catch (Throwable e) {}";
}

Equals.prototype.toString = function() {
	return this.e1.toString() + ".equals(" + this.e2.toString() + ")";
}

Equals.prototype.assert = function() {
	return "assertEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
}

Equals.prototype.verify = function() {
	return this.assert();
	//	return "verifyEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
}

NotEquals.prototype.toString = function() {
	return "!" + this.e1.toString() + ".equals(" + this.e2.toString() + ")";
}

NotEquals.prototype.assert = function() {
	return "assertNotEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
}

NotEquals.prototype.verify = function() {
	return "verifyNotEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
}

RegexpMatch.prototype.toString = function() {
	return "Pattern.compile(" + string(this.pattern) + ").matcher(" + this.expression + ").find()";
}

EqualsArray.prototype.length = function() {
	var self = this;
	return {
		toString: function(index) {
			return self.variableName + ".length";
		}
	}
}

EqualsArray.prototype.item = function(index) {
	var self = this;
	return {
		index: index,
		toString: function(index) {
			return self.variableName + "[" + this.index + "]";
		}
	}
}

EqualsArray.prototype.setup = function(unique) {
	this.variableName = unique ? newVariable("array") : "array";
	return statement(assignToVariable("String[]", this.variableName, this.expression));
}

EqualsArray.prototype.toString = function() {
	return this.conditions.join(" && ");
}

EqualsArray.prototype.assertOrVerify = function(method) {
	var str = this.setup(true);
	for (var i = 0; i < this.conditions.length; i++) {
		str += "\n";
		str += this.conditions[i][method]();
	}
	return str;
}

EqualsArray.prototype.assert = function() {
	return this.assertOrVerify('assert');
}

EqualsArray.prototype.verify = function() {
	return this.assertOrVerify('verify');
}

function pause(milliseconds) {
	return "Thread.sleep(" + parseInt(milliseconds) + ");";
}

function echo(message) {
	return "System.out.println(" + xlateArgument(message) + ");";
}

function statement(expression) {
	return expression.toString() + ';';
}

function array(value) {
	var str = 'new String[] {';
	for (var i = 0; i < value.length; i++) {
		str += string(value[i]);
		if (i < value.length - 1) str += ", ";
	}
	str += '}';
	return str;
}

CallSelenium.prototype.toString = function() {
	var result = '';
	if (this.negative) {
		result += '!';
	}
	if (options.receiver) {
		result += options.receiver + '.';
	}
	result += this.message;
	result += '(';
	for (var i = 0; i < this.args.length; i++) {
		result += this.args[i];
		if (i < this.args.length - 1) {
			result += ', ';
		}
	}
	result += ')';
	return result;
}

function formatComment(comment) {
	return comment.comment.replace(/.+/mg, function(str) {
			return "// " + str;
		});
}

this.options = {
	receiver: "selenium",
	packageName: "",
	superClass: "SeleneseTestCase"
};

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />';

