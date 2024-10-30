<?php
/**
 * Plugin Name:   Modern Admin Comments by WPMarmite
 * Description:   Enhance your administrator/moderator experience in the comments administration pages with a rich text editor.
 * Version:       1.1.4
 * Author:        Modern Plugins
 * Author URI:    https://modernplugins.com/
 * Contributors:  modernplugins, vincentdubroeucq
 * License:       GPL v3 or later
 * License URI:   https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:   modern-admin-comments
 * Domain Path:   languages/
 */

/*
Modern Admin Comments is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.
 
Modern Admin Comments is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
 
You should have received a copy of the GNU General Public License
along with Modern Admin Comments. If not, see https://www.gnu.org/licenses/gpl-3.0.html.
*/

defined( 'ABSPATH' ) || die();

define( 'MODERN_ADMIN_COMMENTS_PATH', plugin_dir_path( __FILE__ ) );
define( 'MODERN_ADMIN_COMMENTS_URL', plugin_dir_url( __FILE__ ) );


add_filter( 'wp_editor_settings', 'modernac_editor_settings', 10, 2 );
/**
 * Filters the settings of the editor for the comment edit screen
 * 
 * @param   array   $settings   Settings of the editor
 * @param   string  $editor_id
 * @return  array   $settings 
 */
function modernac_editor_settings( $settings, $editor_id ){
    if( is_admin() ){
        $screen = get_current_screen();
        if ( 'edit-comments' == $screen->base || 'dashboard' == $screen->base || ( 'comment' == $screen->base && 'edit-comments' == $screen->parent_base ) ) {
            $settings = array(
                'teeny'         => false,
                'quicktags'     => false,
                'media_buttons' => false,
                'tinymce'       => array(
                    'toolbar1' => 'bold,italic,underline,bullist,numlist,link,unlink,codeButton',
                    'toolbar2' => '',
                ),
            );
        }
        
        if( 'edit-comments' == $screen->base || 'dashboard' == $screen->base ){
            $version = get_plugin_data( __FILE__, false, false )['Version'];
            wp_enqueue_script( 'modern-admin-comments', MODERN_ADMIN_COMMENTS_URL . 'js/modern-admin-comments.js' , array( 'wp-tinymce', 'editor', 'wp-i18n', 'jquery' ), $version, true );
        }
    }

    return $settings;
}


add_filter( 'the_editor_content', 'modernac_editor_content', 100, 2 );
/**
 * Filters the editor content to decode it on the edit-comments.php screen
 * 
 * @param   string  $content         The default content of the editor
 * @param   string  $default_editor  The type of editor
 * @return  string  $content
 */
function modernac_editor_content( $content, $default_editor ){
    if( is_admin() ){
        $screen = get_current_screen();
        if ( 'comment' == $screen->base && 'edit-comments' == $screen->parent_base ) {
            $content = htmlspecialchars_decode( $content , ENT_NOQUOTES );
        }
    }
    return $content;
}


add_filter( 'wp_kses_allowed_html', 'modernac_allowed_tags', 10, 2 );
/**
 * Allows for style attributes on paragraphs and lists, to support text-align on tinymce for comments
 * 
 * @param   array   $tags     Allowed HTML tags and attributes
 * @param   string  $context  Context for filtering
 * @return  array   $tags
 */
function modernac_allowed_tags( $tags, $context ){
    if ( 'pre_comment_content' === $context ) {
        $tags['p'] = array();
        $tags['ul'] = array();
        $tags['ol'] = array();
        $tags['li'] = array();
        $tags['span'] = array(
            'style' => true,
        );
    }
    return $tags;
}


add_filter( 'mce_external_plugins', 'modernac_register_code_button' );
/**
 * Registers the script for the tinymce code button
 * 
 * @param   array  $plugins  registered TinyMce plugins
 * @return  array  $plugins  
 */
function modernac_register_code_button( $plugins ) {
    $screen = get_current_screen();
    if ( 'edit-comments' == $screen->base || ( 'comment' == $screen->base && 'edit-comments' == $screen->parent_base ) ) {
        $plugins['codeButton'] = MODERN_ADMIN_COMMENTS_URL . '/js/code_button.js';
    }
	return $plugins;
}


add_filter( 'wp_mce_translation', 'modernac_mce_translation', 10, 2 );
/**
 * Registers translatabled strings for the nnew tinymce button
 * 
 * @param   array  $mce_translation  Strings to translate
 * @param   array  $mce_locale       Locale
 * @return  array  $mce_translation  
 */
function modernac_mce_translation( $mce_translation, $mce_locale ){
    $mce_translation['Insert/edit code'] = __( 'Insert/edit code', 'modern-admin-comments' );
    return $mce_translation;
}