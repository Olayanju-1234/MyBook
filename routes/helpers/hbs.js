const moment = require('moment');

module.exports = {
    // Format date
    formatDate: (date, format) => {
        return moment(date).utc().format(format);
    },
    // Truncate string
    truncate: (str, len) => {
        return str.length > len ? str.substring(0, len - 3) + '...' : str;
    },
    // Strip HTML tags
    stripTags: (str) => {
        return str.replace(/<(?:.|\n)*?>/gm, '');
    },
    // Capitalize first letter
    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    // Edit icon for story
    // editIcon: (storyUser, loggedUser, storyId, floating = true) => {
    //     if (storyUser._id.toString() == loggedUser._id.toString()) {
    //         if (floating) {
    //             return `<a href="/stories/edit/${storyId}" class="btn-floating halfway-fab cyan"><i class="fas fa-edit fa-small"></i></a>`
    //         } else {
    //             return `<a href="/stories/edit/${storyId}" class="btn btn-outline-info mr-1"><i class="fas fa-edit"></i></a>`
    //         }
    //     }
    //     else {
    //         return '';
    //     }
    // },
    // Select
    select: (selected, options) => {
        return options.fn(this).replace(
            new RegExp(' value=\"' + selected + '\"'),
            '$& selected="selected"'
        );
    }

    }
