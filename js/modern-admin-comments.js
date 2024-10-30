/**
 * Overrides the function for opening and saving quick edit or reply form
 *
 * @memberof commentReply
 *
 * @param {number} comment_id The comment id to open an editor for.
 * @param {number} post_id The post id to open an editor for.
 * @param {string} action The action to perform. Either 'edit' or 'replyto'.
 *
 * @return {boolean} Always false.
 */
(function ($) {
    if (!window.commentReply) return;
    __ = wp.i18n.__;
    window.commentReply.open = function (comment_id, post_id, action) {
        var editRow, rowData, act, replyButton, editHeight,
            t = this,
            c = $('#comment-' + comment_id),
            h = c.height(),
            colspanVal = 0;

        if (!this.discardCommentChanges()) {
            return false;
        }

        t.close();
        t.cid = comment_id;

        editRow = $('#replyrow');
        rowData = $('#inline-' + comment_id);
        action = action || 'replyto';
        act = 'edit' == action ? 'edit' : 'replyto';
        act = t.act = act + '-comment';
        t.originalContent = $('textarea.comment', rowData).val();
        colspanVal = $('> th:visible, > td:visible', c).length;

        // Make sure it's actually a table and there's a `colspan` value to apply.
        if (editRow.hasClass('inline-edit-row') && 0 !== colspanVal) {
            $('td', editRow).attr('colspan', colspanVal);
        }

        $('#action', editRow).val(act);
        $('#comment_post_ID', editRow).val(post_id);
        $('#comment_ID', editRow).val(comment_id);

        if (action == 'edit') {
            $('#author-name', editRow).val($('div.author', rowData).text());
            $('#author-email', editRow).val($('div.author-email', rowData).text());
            $('#author-url', editRow).val($('div.author-url', rowData).text());
            $('#status', editRow).val($('div.comment_status', rowData).text());
            $('#replycontent', editRow).val($('textarea.comment', rowData).val());
            $('#edithead, #editlegend, #savebtn', editRow).show();
            $('#replyhead, #replybtn, #addhead, #addbtn', editRow).hide();

            if (h > 120) {
                // Limit the maximum height when editing very long comments to make it more manageable.
                // The textarea is resizable in most browsers, so the user can adjust it if needed.
                editHeight = h > 500 ? 500 : h;
                $('#replycontent', editRow).css('height', editHeight + 'px');
            }

            c.after(editRow).fadeOut('fast', function () {
                $('#replyrow').fadeIn(300, function () { $(this).show(); });
            });
        } else if (action == 'add') {
            $('#addhead, #addbtn', editRow).show();
            $('#replyhead, #replybtn, #edithead, #editlegend, #savebtn', editRow).hide();
            $('#the-comment-list').prepend(editRow);
            $('#replyrow').fadeIn(300);
        } else {
            replyButton = $('#replybtn', editRow);
            $('#edithead, #editlegend, #savebtn, #addhead, #addbtn', editRow).hide();
            $('#replyhead, #replybtn', editRow).show();
            c.after(editRow);

            if (c.hasClass('unapproved')) {
                'undefined' === typeof (__) ? replyButton.text(adminCommentsL10n.replyApprove) : replyButton.text(__('Approve and Reply'));
            } else {
                'undefined' === typeof (__) ? replyButton.text(adminCommentsL10n.reply) : replyButton.text(__('Reply'));
            }

            $('#replyrow').fadeIn(300, function () { $(this).show(); });
        }

        setTimeout(function () {
            var rtop, rbottom, scrollTop, vp, scrollBottom;

            rtop = $('#replyrow').offset().top;
            rbottom = rtop + $('#replyrow').height();
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            vp = document.documentElement.clientHeight || window.innerHeight || 0;
            scrollBottom = scrollTop + vp;

            if (scrollBottom - 20 < rbottom)
                window.scroll(0, rbottom - vp + 35);
            else if (rtop - 20 < scrollTop)
                window.scroll(0, rtop - 35);

            $('#replycontent').focus().keyup(function (e) {
                if (e.which == 27)
                    commentReply.revert(); // close on Escape
            });
        }, 600);

        // Reset Editor
        const editor = tinymce.get('replycontent');
        const textAreaContent = $('#replycontent', editRow).val();
        const removedEditor = tinymce.remove(editor);

        // Fill in textarea with the right content
        if (action === 'edit') {
            $('#replycontent', editRow).val(textAreaContent);
        } else {
            $('#replycontent', editRow).val('');
        }

        // Init Tinymce
        editor.settings['auto_focus'] = 'replycontent';
        editor.settings['init_instance_callback'] = function (editor) {
            editor.shortcuts.add("meta+13", "Submit comment", function () {
                $('.reply-submit-buttons .save').click();
            });
        }
        tinymce.init(editor.settings);
        editor.save();
        return false;
    };
    window.commentReply.send = function () {
        // Save content to text Area
        const editor = tinymce.get('replycontent');
        editor.save();

        var post = {},
            $errorNotice = $('#replysubmit .error-notice');

        $errorNotice.addClass('hidden');
        $('#replysubmit .spinner').addClass('is-active');

        $('#replyrow input').not(':button').each(function () {
            var t = $(this);
            post[t.attr('name')] = t.val();
        });

        post.content = $('#replycontent').val();
        post.id = post.comment_post_ID;
        post.comments_listing = this.comments_listing;
        post.p = $('[name="p"]').val();

        if ($('#comment-' + $('#comment_ID').val()).hasClass('unapproved'))
            post.approve_parent = 1;

        $.ajax({
            type: 'POST',
            url: ajaxurl,
            data: post,
            success: function (x) { commentReply.show(x); },
            error: function (r) { commentReply.error(r); }
        });
    };
}(jQuery));

