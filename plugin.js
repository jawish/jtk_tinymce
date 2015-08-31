/**
 * plugin.js
 *
 * Thaana keyboard handler for TinyMCE WYSIWYG editor using JTK library.
 * @author  Jawish Hameed <jaa@jawish.org>
 */
tinymce.PluginManager.add('jtk', function(editor) {
	var defaultLanguages = [ 'English', 'Thaana', 'Arabic' ],
		defaultGuessThreshold = 0.8,
		defaultGuessRegexes = [ 
            /[\u0000-\u007F\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF]/g, 
            /[\u0780-\u07BF]/g, 
            /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g ];

    var activeLanguage = editor.settings.jtk_active_language || defaultLanguages[0];

	function guessLanguage(text) {
		var match = null,
		    guessThreshold = editor.settings.jtk_language_guess_threshold || defaultGuessThreshold,
			guessRegexes = editor.settings.jtk_language_guess_regexes || defaultGuessRegexes,
            inputLanguages = editor.settings.jtk_languages || defaultLanguages;
        
		tinymce.each(guessRegexes, function(regex, index) {
			var charCount = text.match(regex);
			var charRatio = (charCount ? charCount.length : 0) / text.length;
            
			if (charRatio >= guessThreshold) {
				match = index;
				return false;
			}
		});

		return inputLanguages[match] || null;
	}

	function createInputLanguageChangeHandler(items) {
		return function() {
			var self = this;
            
			editor.on('nodeChange', function(e) {
				var text = null,
                    rng = editor.selection.getRng();

                rng.expand('word');
                var language = guessLanguage(rng.toString());
                
                if (language) {
                	setActiveLanguage(language);
                    self.value(language);
                }
                
                return true;
			});
		};
	}

	function setActiveLanguage(fmt) {
		if (fmt.control) {
			fmt = fmt.control.value();
		}

		if (fmt) {
			activeLanguage = fmt;
		}
	}

	if (typeof thaanaKeyboard == "undefined") {
		console.log('JTK for TinyMCE needs JTK to be available and loaded before TinyMCE.');
	}

	editor.on('keypress', function (e) {
		if (activeLanguage == 'Thaana') {
			thaanaKeyboard.value = '';
			thaanaKeyboard.handleKey(e);
			editor.insertContent(thaanaKeyboard.value);
		}
	});

	editor.addCommand('jtkSetActiveLanguage', setActiveLanguage);

	editor.addButton('jtklanguage', function() {
		var items = [];
		var inputLanguages = editor.settings.jtk_languages || defaultLanguages;

		tinymce.each(inputLanguages, function(item) {
			items.push({text: item, value: item});
		});

		return {
			type: 'listbox',
			text: 'Keyboard',
			tooltip: 'Keyboard Language',
			values: items,
			fixedWidth: true,
			onPostRender: createInputLanguageChangeHandler(items),
			onclick: setActiveLanguage
		};
	});
});