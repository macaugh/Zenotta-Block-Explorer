declare module '*.css';
declare module '*.scss';
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';
declare module '*.json';
declare module 'chi-ui';

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