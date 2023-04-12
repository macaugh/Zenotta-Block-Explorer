import React from "react";
import { Card } from "react-bootstrap";
import ReactImageFallback from "react-image-fallback";
import styles from './NFTCard.scss';

import LoadingIcon from "static/img/hands.gif";
import NotFound from "static/img/nfnft.svg";

export const NFTCard = (props: any) => {
  const { name, image, description } = props;

  return (
    <Card style={{ width: "18rem", margin: "0 1rem 0 0" }}>
      <ReactImageFallback
        src={image}
        fallbackImage={NotFound}
        initialImage={LoadingIcon}
        alt="Zenotta NFT"
        className={styles.image}
      />
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Text>{description}</Card.Text>
        {props.external_url && (
          <a href={props.external_url} target="_blank">
            <button className="btn btn-primary">External View</button>
          </a>
        )}
      </Card.Body>
    </Card>
  );
};
