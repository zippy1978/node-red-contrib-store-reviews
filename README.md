# node-red-contrib-store-reviews
A set of input node to retrieve user reviews on application stores such as Apple App Store or Google Play.

## Install

	cd ~\.node-red
	npm install node-red-contrib-store-reviews

## Usage

Once installed nodes are available in the *input* section.

### Available nodes

 * **appstore**: a node to retrieve application reviews on Apple App Store
 * **googleplay**: a node to retrieve application reviews on Google Play

 ### Release notes

 * **0.2.2**: fixed concurrency issue with appstore node
 * **0.2.1**: multiple apps supports for a single input
