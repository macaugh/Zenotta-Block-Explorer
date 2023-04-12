declare module '*.css';
declare module '*.scss';
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';
declare module '*.json';
declare module '*.gif';
declare module 'chi-ui';
declare module 'react-image-fallback';

declare global {
    namespace JSX {
        type Element = Tree;

        interface ElementAttributesProperty {
            props: {};
        }

        interface ElementChildrenAttribute {
            children: {};
        }
    }    
}