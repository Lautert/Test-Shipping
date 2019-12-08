/*! Application - v0.0.0 - 2019-12-08 */
"use strict";

(function(factory, jQuery, Zepto) {
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery || Zepto);
    }
})(function($) {
    var Mask = function(el, mask, options) {
        var p = {
            invalid: [],
            getCaret: function() {
                try {
                    var sel, pos = 0, ctrl = el.get(0), dSel = document.selection, cSelStart = ctrl.selectionStart;
                    if (dSel && navigator.appVersion.indexOf("MSIE 10") === -1) {
                        sel = dSel.createRange();
                        sel.moveStart("character", -p.val().length);
                        pos = sel.text.length;
                    } else if (cSelStart || cSelStart === "0") {
                        pos = cSelStart;
                    }
                    return pos;
                } catch (e) {}
            },
            setCaret: function(pos) {
                try {
                    if (el.is(":focus")) {
                        var range, ctrl = el.get(0);
                        pos += 1;
                        if (ctrl.setSelectionRange) {
                            ctrl.setSelectionRange(pos, pos);
                        } else {
                            range = ctrl.createTextRange();
                            range.collapse(true);
                            range.moveEnd("character", pos);
                            range.moveStart("character", pos);
                            range.select();
                        }
                    }
                } catch (e) {}
            },
            events: function() {
                el.on("keydown.mask", function(e) {
                    el.data("mask-keycode", e.keyCode || e.which);
                }).on($.jMaskGlobals.useInput ? "input.mask" : "keyup.mask", p.behaviour).on("paste.mask drop.mask", function() {
                    setTimeout(function() {
                        el.keydown().keyup();
                    }, 100);
                }).on("change.mask", function() {
                    el.data("changed", true);
                }).on("blur.mask", function() {
                    if (oldValue !== p.val() && !el.data("changed")) {
                        el.trigger("change");
                    }
                    el.data("changed", false);
                }).on("blur.mask", function() {
                    oldValue = p.val();
                }).on("focus.mask", function(e) {
                    if (options.selectOnFocus === true) {
                        $(e.target).select();
                    }
                }).on("focusout.mask", function() {
                    if (options.clearIfNotMatch && !regexMask.test(p.val())) {
                        p.val("");
                    }
                });
            },
            getRegexMask: function() {
                var maskChunks = [], translation, pattern, optional, recursive, oRecursive, r;
                for (var i = 0; i < mask.length; i++) {
                    translation = jMask.translation[mask.charAt(i)];
                    if (translation) {
                        pattern = translation.pattern.toString().replace(/.{1}$|^.{1}/g, "");
                        optional = translation.optional;
                        recursive = translation.recursive;
                        if (recursive) {
                            maskChunks.push(mask.charAt(i));
                            oRecursive = {
                                digit: mask.charAt(i),
                                pattern: pattern
                            };
                        } else {
                            maskChunks.push(!optional && !recursive ? pattern : pattern + "?");
                        }
                    } else {
                        maskChunks.push(mask.charAt(i).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
                    }
                }
                r = maskChunks.join("");
                if (oRecursive) {
                    r = r.replace(new RegExp("(" + oRecursive.digit + "(.*" + oRecursive.digit + ")?)"), "($1)?").replace(new RegExp(oRecursive.digit, "g"), oRecursive.pattern);
                }
                return new RegExp(r);
            },
            destroyEvents: function() {
                el.off([ "input", "keydown", "keyup", "paste", "drop", "blur", "focusout", "" ].join(".mask "));
            },
            val: function(v) {
                var isInput = el.is("input"), method = isInput ? "val" : "text", r;
                if (arguments.length > 0) {
                    if (el[method]() !== v) {
                        el[method](v);
                    }
                    r = el;
                } else {
                    r = el[method]();
                }
                return r;
            },
            getMCharsBeforeCount: function(index, onCleanVal) {
                for (var count = 0, i = 0, maskL = mask.length; i < maskL && i < index; i++) {
                    if (!jMask.translation[mask.charAt(i)]) {
                        index = onCleanVal ? index + 1 : index;
                        count++;
                    }
                }
                return count;
            },
            caretPos: function(originalCaretPos, oldLength, newLength, maskDif) {
                var translation = jMask.translation[mask.charAt(Math.min(originalCaretPos - 1, mask.length - 1))];
                return !translation ? p.caretPos(originalCaretPos + 1, oldLength, newLength, maskDif) : Math.min(originalCaretPos + newLength - oldLength - maskDif, newLength);
            },
            behaviour: function(e) {
                e = e || window.event;
                p.invalid = [];
                var keyCode = el.data("mask-keycode");
                if ($.inArray(keyCode, jMask.byPassKeys) === -1) {
                    var caretPos = p.getCaret(), currVal = p.val(), currValL = currVal.length, newVal = p.getMasked(), newValL = newVal.length, maskDif = p.getMCharsBeforeCount(newValL - 1) - p.getMCharsBeforeCount(currValL - 1), changeCaret = caretPos < currValL && newVal !== currVal;
                    p.val(newVal);
                    if (changeCaret) {
                        !(keyCode === 8 || keyCode === 46) ? caretPos = p.caretPos(caretPos, currValL, newValL, maskDif) : caretPos -= 1;
                        p.setCaret(caretPos);
                    }
                    return p.callbacks(e);
                }
            },
            getMasked: function(skipMaskChars, val) {
                var buf = [], value = val === undefined ? p.val() : val + "", m = 0, maskLen = mask.length, v = 0, valLen = value.length, offset = 1, addMethod = "push", resetPos = -1, lastMaskChar, check;
                if (options.reverse) {
                    addMethod = "unshift";
                    offset = -1;
                    lastMaskChar = 0;
                    m = maskLen - 1;
                    v = valLen - 1;
                    check = function() {
                        return m > -1 && v > -1;
                    };
                } else {
                    lastMaskChar = maskLen - 1;
                    check = function() {
                        return m < maskLen && v < valLen;
                    };
                }
                var lastUntranslatedMaskChar;
                while (check()) {
                    var maskDigit = mask.charAt(m), valDigit = value.charAt(v), translation = jMask.translation[maskDigit];
                    if (translation) {
                        if (valDigit.match(translation.pattern)) {
                            buf[addMethod](valDigit);
                            if (translation.recursive) {
                                if (resetPos === -1) {
                                    resetPos = m;
                                } else if (m === lastMaskChar) {
                                    m = resetPos - offset;
                                }
                                if (lastMaskChar === resetPos) {
                                    m -= offset;
                                }
                            }
                            m += offset;
                        } else if (valDigit === lastUntranslatedMaskChar) {
                            lastUntranslatedMaskChar = undefined;
                        } else if (translation.optional) {
                            m += offset;
                            v -= offset;
                        } else if (translation.fallback) {
                            buf[addMethod](translation.fallback);
                            m += offset;
                            v -= offset;
                        } else {
                            p.invalid.push({
                                p: v,
                                v: valDigit,
                                e: translation.pattern
                            });
                        }
                        v += offset;
                    } else {
                        if (!skipMaskChars) {
                            buf[addMethod](maskDigit);
                        }
                        if (valDigit === maskDigit) {
                            v += offset;
                        } else {
                            lastUntranslatedMaskChar = maskDigit;
                        }
                        m += offset;
                    }
                }
                var lastMaskCharDigit = mask.charAt(lastMaskChar);
                if (maskLen === valLen + 1 && !jMask.translation[lastMaskCharDigit]) {
                    buf.push(lastMaskCharDigit);
                }
                return buf.join("");
            },
            callbacks: function(e) {
                var val = p.val(), changed = val !== oldValue, defaultArgs = [ val, e, el, options ], callback = function(name, criteria, args) {
                    if (typeof options[name] === "function" && criteria) {
                        options[name].apply(this, args);
                    }
                };
                callback("onChange", changed === true, defaultArgs);
                callback("onKeyPress", changed === true, defaultArgs);
                callback("onComplete", val.length === mask.length, defaultArgs);
                callback("onInvalid", p.invalid.length > 0, [ val, e, el, p.invalid, options ]);
            }
        };
        el = $(el);
        var jMask = this, oldValue = p.val(), regexMask;
        mask = typeof mask === "function" ? mask(p.val(), undefined, el, options) : mask;
        jMask.mask = mask;
        jMask.options = options;
        jMask.remove = function() {
            var caret = p.getCaret();
            p.destroyEvents();
            p.val(jMask.getCleanVal());
            p.setCaret(caret - p.getMCharsBeforeCount(caret));
            return el;
        };
        jMask.getCleanVal = function() {
            return p.getMasked(true);
        };
        jMask.getMaskedVal = function(val) {
            return p.getMasked(false, val);
        };
        jMask.init = function(onlyMask) {
            onlyMask = onlyMask || false;
            options = options || {};
            jMask.clearIfNotMatch = $.jMaskGlobals.clearIfNotMatch;
            jMask.byPassKeys = $.jMaskGlobals.byPassKeys;
            jMask.translation = $.extend({}, $.jMaskGlobals.translation, options.translation);
            jMask = $.extend(true, {}, jMask, options);
            regexMask = p.getRegexMask();
            if (onlyMask) {
                p.events();
                p.val(p.getMasked());
            } else {
                if (options.placeholder) {
                    el.attr("placeholder", options.placeholder);
                }
                if (el.data("mask")) {
                    el.attr("autocomplete", "off");
                }
                for (var i = 0, maxlength = true; i < mask.length; i++) {
                    var translation = jMask.translation[mask.charAt(i)];
                    if (translation && translation.recursive) {
                        maxlength = false;
                        break;
                    }
                }
                if (maxlength) {
                    el.attr("maxlength", mask.length);
                }
                p.destroyEvents();
                p.events();
                var caret = p.getCaret();
                p.val(p.getMasked());
                p.setCaret(caret + p.getMCharsBeforeCount(caret, true));
            }
        };
        jMask.init(!el.is("input"));
    };
    $.maskWatchers = {};
    var HTMLAttributes = function() {
        var input = $(this), options = {}, prefix = "data-mask-", mask = input.attr("data-mask");
        if (input.attr(prefix + "reverse")) {
            options.reverse = true;
        }
        if (input.attr(prefix + "clearifnotmatch")) {
            options.clearIfNotMatch = true;
        }
        if (input.attr(prefix + "selectonfocus") === "true") {
            options.selectOnFocus = true;
        }
        if (notSameMaskObject(input, mask, options)) {
            return input.data("mask", new Mask(this, mask, options));
        }
    }, notSameMaskObject = function(field, mask, options) {
        options = options || {};
        var maskObject = $(field).data("mask"), stringify = JSON.stringify, value = $(field).val() || $(field).text();
        try {
            if (typeof mask === "function") {
                mask = mask(value);
            }
            return typeof maskObject !== "object" || stringify(maskObject.options) !== stringify(options) || maskObject.mask !== mask;
        } catch (e) {}
    }, eventSupported = function(eventName) {
        var el = document.createElement("div"), isSupported;
        eventName = "on" + eventName;
        isSupported = eventName in el;
        if (!isSupported) {
            el.setAttribute(eventName, "return;");
            isSupported = typeof el[eventName] === "function";
        }
        el = null;
        return isSupported;
    };
    $.fn.mask = function(mask, options) {
        options = options || {};
        var selector = this.selector, globals = $.jMaskGlobals, interval = globals.watchInterval, watchInputs = options.watchInputs || globals.watchInputs, maskFunction = function() {
            if (notSameMaskObject(this, mask, options)) {
                return $(this).data("mask", new Mask(this, mask, options));
            }
        };
        $(this).each(maskFunction);
        if (selector && selector !== "" && watchInputs) {
            clearInterval($.maskWatchers[selector]);
            $.maskWatchers[selector] = setInterval(function() {
                $(document).find(selector).each(maskFunction);
            }, interval);
        }
        return this;
    };
    $.fn.masked = function(val) {
        return this.data("mask").getMaskedVal(val);
    };
    $.fn.unmask = function() {
        clearInterval($.maskWatchers[this.selector]);
        delete $.maskWatchers[this.selector];
        return this.each(function() {
            var dataMask = $(this).data("mask");
            if (dataMask) {
                dataMask.remove().removeData("mask");
            }
        });
    };
    $.fn.cleanVal = function() {
        return this.data("mask").getCleanVal();
    };
    $.applyDataMask = function(selector) {
        selector = selector || $.jMaskGlobals.maskElements;
        var $selector = selector instanceof $ ? selector : $(selector);
        $selector.filter($.jMaskGlobals.dataMaskAttr).each(HTMLAttributes);
    };
    var globals = {
        maskElements: "input,td,span,div",
        dataMaskAttr: "*[data-mask]",
        dataMask: true,
        watchInterval: 300,
        watchInputs: true,
        useInput: eventSupported("input"),
        watchDataMask: false,
        byPassKeys: [ 9, 16, 17, 18, 36, 37, 38, 39, 40, 91 ],
        translation: {
            0: {
                pattern: /\d/
            },
            9: {
                pattern: /\d/,
                optional: true
            },
            "#": {
                pattern: /\d/,
                recursive: true
            },
            A: {
                pattern: /[a-zA-Z0-9]/
            },
            S: {
                pattern: /[a-zA-Z]/
            }
        }
    };
    $.jMaskGlobals = $.jMaskGlobals || {};
    globals = $.jMaskGlobals = $.extend(true, {}, globals, $.jMaskGlobals);
    if (globals.dataMask) {
        $.applyDataMask();
    }
    setInterval(function() {
        if ($.jMaskGlobals.watchDataMask) {
            $.applyDataMask();
        }
    }, globals.watchInterval);
}, window.jQuery, window.Zepto);

(function($) {
    $(document).ready(function() {
        $("body").on("focus", ".phone", function() {
            var maskBehavior = function(val) {
                return val.replace(/\D/g, "").length === 11 ? "(00) 00000-0000" : "(00) 0000-00009";
            }, options = {
                onKeyPress: function(val, e, field, options) {
                    field.mask(maskBehavior.apply({}, arguments), options);
                }
            };
            $(this).mask(maskBehavior, options);
        });
        $("body").on("focus", ".mail", function() {
            $(this).mask("A", {
                translation: {
                    A: {
                        pattern: /[\w@\-._]/,
                        recursive: true
                    }
                }
            });
        });
        $("body").on("focus", ".ncm", function() {
            $(this).mask("0000.0000");
        });
        $("body").on("focus", ".cep", function() {
            $(this).mask("00000-000");
        });
        $("body").on("focus", ".date", function() {
            $(this).mask("00/00/0000");
        });
        $("body").on("click", ".date", function(e) {
            $(this).datepicker({
                showOtherMonths: true,
                showButtonPanel: true,
                selectOtherMonths: true,
                changeMonth: true,
                changeYear: true,
                language: "pt"
            });
            $(this).datepicker("show");
        });
        $("body").on("focus", ".hora", function() {
            $(this).mask("00:00");
        });
        $("body").on("focus", ".cnpj", function() {
            $(this).mask("00.000.000/0000-00");
        });
        $("body").on("focus", ".cpf", function() {
            $(this).mask("000.000.000-00");
        });
        $("body").on("focus", ".rg", function() {
            $(this).mask("00.000.000-0");
        });
        $("body").on("focus", ".money", function() {
            $(this).mask("#.##0,00", {
                reverse: true
            });
        });
        $("body").on("focus", ".onlyNumber", function() {
            $(this).mask("#");
        });
    });
})(jQuery);

var AmountComponent = function($) {
    function AmountComponent(elem) {
        this.element = $(elem);
        this.callback = [];
        this.events();
    }
    AmountComponent.prototype = {
        addCallback: function(callback) {
            this.callback.push(callback);
        },
        events: function() {
            var _this = this;
            _this.element.on("change", "input", function() {
                var value = parseInt(this.value.replace(/[^\d+-]/g, ""));
                if (isNaN(value) || value < 0) {
                    this.value = 0;
                }
            });
            _this.element.on("click", ".up", function() {
                var input = _this.element.find("input");
                input.val(parseInt(input.val()) + 1);
                $(input).trigger("change");
            });
            _this.element.on("click", ".down", function() {
                var input = _this.element.find("input");
                input.val(parseInt(input.val()) - 1);
                $(input).trigger("change");
            });
        }
    };
    $.fn.AmountComponent = function() {
        new AmountComponent(this);
    };
    return AmountComponent;
}(jQuery);

$(document).ready(function() {
    $(".amount-component").map(function(key, elem) {
        new AmountComponent(this);
    });
});

$(document).ready(function() {
    var Products = [ {
        id: 1,
        name: "Apple",
        price: 20
    }, {
        id: 2,
        name: "Banana",
        price: 10
    }, {
        id: 3,
        name: "Orange",
        price: 30
    } ];
    var productList = $(".content-product-list ul");
    Products.map(function(data, key) {
        var curr = productList.find(".model").clone();
        curr.removeClass("model");
        curr.find('input[type="hidden"]').val(data.id);
        curr.find(".name").text(data.name);
        curr.find(".unit").text("$ " + data.price);
        curr.find(".total").text("$ 0");
        curr.find(".amount-component input").attr("name", "amount[" + data.id + "]");
        curr.find(".amount").AmountComponent();
        productList.append(curr);
    });
    var Coupons = [ {
        id: 1,
        name: "A",
        text: "(30%)",
        benefit: {
            subtotal: {
                reduce: {
                    percentage: 30
                }
            }
        }
    }, {
        id: 2,
        name: "FOO",
        text: "$ 100",
        benefit: {
            total: {
                reduce: {
                    fixed: 100
                }
            }
        },
        conditions: [ {
            total: {
                min: 101
            }
        } ]
    }, {
        id: 3,
        name: "C",
        text: "Free Shipping",
        benefit: {
            shipping: {
                value: {
                    fixed: 0
                }
            }
        },
        conditions: [ {
            subtotal: {
                min: 300.5,
                max: 400
            }
        } ]
    } ];
    var CouponCode = [ {
        code: "111",
        id: 1
    }, {
        code: "222",
        id: 2
    }, {
        code: "333",
        id: 3
    } ];
    var rules = [ {
        rule: {
            shipping: {
                value: {
                    fixed: 30
                }
            }
        },
        conditions: [ {
            kg: {
                min: 1
            }
        } ]
    }, {
        rule: {
            shipping: {
                addition: {
                    fixed: 7
                }
            }
        },
        conditions: [ {
            kg: {
                min: 10
            }
        }, {
            kg: {
                mult: 5,
                recursive: true
            }
        } ]
    }, {
        rule: {
            shipping: {
                value: {
                    fixed: 0
                }
            }
        },
        conditions: [ {
            subtotal: {
                min: 400
            }
        } ]
    } ];
    var Cart = function($) {
        function shoppingCart(elem) {
            var _this = this;
            var elem = $(elem);
            _this.elem = {
                cart: elem,
                productList: elem.find(".content-product-list"),
                couponList: elem.find(".content-coupons-list ul"),
                subtotal: elem.find(".subtotal"),
                shipping: elem.find(".shipping"),
                total: elem.find(".total"),
                couponApply: elem.find(".coupon-apply")
            };
            _this.products = {};
            _this.coupons = {};
            Coupons.map(function(data) {
                _this.coupons[data.id] = false;
            });
            _this.subtotal = 0;
            _this.shipping = 0;
            _this.total = 0;
            _this.events();
        }
        shoppingCart.prototype = {
            events: function() {
                var _this = this;
                _this.elem.productList.find(".product").on("change", 'input[type="text"]', function() {
                    var currProduct = $(this).parents(".product:eq(0)");
                    var id = currProduct.find('input[type="hidden"]').val();
                    var amount = parseInt(currProduct.find('input[type="text"]').val());
                    var price = Products.filter((data, key) => data.id == id)[0].price;
                    var total = parseFloat(amount * price);
                    if (total > 0) {
                        _this.products[id] = {
                            amount: amount,
                            total: total
                        };
                    } else {
                        delete _this.products[id];
                    }
                    currProduct.find(".total").text("$ " + total);
                    _this.invoice();
                });
                _this.elem.couponApply.on("click", "button", function() {
                    var coupon = _this.elem.couponApply.find('input[type="text"]').val();
                    if (coupon.length > 0) {
                        var data = CouponCode.filter((data, key) => data.code == coupon);
                        if (data.length > 0) {
                            var couponId = data[0].id;
                            if (!_this.coupons[couponId]) {
                                coupon = Coupons.filter((data, key) => data.id == couponId)[0];
                                _this.coupons[coupon.id] = true;
                                var curr = _this.elem.couponList.find(".model").clone();
                                var input = curr.find('input[type="hidden"]');
                                curr.removeClass("model");
                                input.val(coupon.id);
                                input.attr("name", "coupon[" + couponId + "]");
                                curr.find(".name").text("Coupon " + coupon.name);
                                _this.elem.couponList.append(curr);
                                _this.invoice();
                            }
                        } else {
                            console.log("coupon not valid");
                        }
                    }
                });
                _this.elem.couponList.on("click", ".coupon-remove", function() {
                    var currCoupon = $(this).parents(".coupon:eq(0)");
                    var id = currCoupon.find('input[type="hidden"]').val();
                    _this.coupons[id] = false;
                    currCoupon.remove();
                    _this.invoice();
                });
                _this.elem.cart.on("submit", function() {
                    var data = $(this).serializeArray();
                    console.log(data);
                });
            },
            invoice: function() {
                var _this = this;
                var invoice = {
                    subtotal: Object.values(_this.products).reduce((total, data) => total + data.total, 0),
                    shipping: 0,
                    amount: Object.values(_this.products).reduce((total, data) => total + data.amount, 0)
                };
                invoice.total = invoice.subtotal + invoice.shipping;
                function applyBenefit(values, benefit) {
                    var data = benefit;
                    if (data.shipping) {
                        if (data.shipping.value) {
                            if (data.shipping.value.fixed !== undefined) {
                                values.shipping = data.shipping.value.fixed;
                                values.total = values.subtotal + values.shipping;
                            }
                        }
                        if (data.shipping.addition) {
                            if (data.shipping.addition.fixed !== undefined) {
                                values.shipping += data.shipping.addition.fixed;
                                values.total = values.subtotal + values.shipping;
                            }
                        }
                    }
                    if (data.subtotal) {
                        if (data.subtotal.reduce) {
                            if (data.subtotal.reduce.percentage !== undefined) {
                                values.subtotal = values.subtotal - values.subtotal * (data.subtotal.reduce.percentage / 100);
                                values.total = values.subtotal + values.shipping;
                            }
                        }
                    }
                    if (data.total) {
                        if (data.total.reduce) {
                            if (data.total.reduce.fixed !== undefined) {
                                values.total = values.total - data.total.reduce.fixed;
                            }
                        }
                    }
                    return values;
                }
                rules.map(function(rule) {
                    var steps = [];
                    var recursive = 1;
                    rule.conditions.map(function(data) {
                        if (data.kg) {
                            if (data.kg.max) {
                                steps.push(invoice.amount <= data.kg.max);
                            }
                            if (data.kg.min) {
                                steps.push(invoice.amount >= data.kg.min);
                            }
                            if (data.kg.mult) {
                                steps.push(invoice.amount / data.kg.mult > 2);
                            }
                            if (data.kg.recursive) {
                                var r = Math.ceil(invoice.amount / data.kg.mult) - 2;
                                recursive = r > 0 ? r : 1;
                            }
                        } else if (data.subtotal) {
                            if (data.subtotal.min) {
                                steps.push(invoice.subtotal >= data.subtotal.min);
                            }
                        }
                    });
                    if (steps.reduce((bool, value) => bool && value)) {
                        for (var i = 0; i < recursive; i++) {
                            invoice = applyBenefit(invoice, rule.rule);
                        }
                    }
                });
                var coupons = [];
                for (var i in _this.coupons) {
                    if (_this.coupons[i]) {
                        coupons.push(i);
                    }
                }
                coupons.map(function(id) {
                    var coupon = Coupons.filter(data => data.id == id)[0];
                    var elemCoupon = _this.elem.couponList.find('input[type="hidden"][value="' + id + '"]').parents(".coupon:eq(0)");
                    var couponText = coupon.text;
                    if (id == 1) {
                        var valueReduce = invoice.subtotal * (coupon.benefit.subtotal.reduce.percentage / 100);
                        couponText = "$ -" + valueReduce + " " + couponText;
                    }
                    elemCoupon.find(".coupon-benefits").text(couponText);
                    var steps = [];
                    var recursive = 1;
                    if (coupon.conditions) {
                        coupon.conditions.map(function(data) {
                            if (data.subtotal) {
                                if (data.subtotal.min) {
                                    steps.push(invoice.subtotal >= data.subtotal.min);
                                }
                                if (data.subtotal.max) {
                                    steps.push(invoice.subtotal < data.subtotal.max);
                                }
                            }
                            if (data.total) {
                                if (data.total.min) {
                                    steps.push(invoice.total >= data.total.min);
                                }
                            }
                        });
                    } else {
                        steps.push(true);
                    }
                    if (steps.reduce((bool, value) => bool && value)) {
                        for (var i = 0; i < recursive; i++) {
                            invoice = applyBenefit(invoice, coupon.benefit);
                        }
                        elemCoupon.find(".coupon-benefits").removeClass("error");
                    } else {
                        elemCoupon.find(".coupon-benefits").addClass("error");
                    }
                });
                _this.elem.subtotal.find(".value").text("$ " + invoice.subtotal);
                _this.elem.shipping.find(".value").text("$ " + invoice.shipping);
                _this.elem.total.find(".value").text("$ " + invoice.total);
            }
        };
        return shoppingCart;
    }(jQuery);
    new Cart(".form-content-cart");
});