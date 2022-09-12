import * as React from "react";
import { useObserver } from "mobx-react";
import * as styles from "./Footer.scss";
import Bg from "static/img/bg.svg";
import LinkedIn from "static/img/linkedin.svg";
import Twitter from "static/img/twitter.svg";
import Facebook from "static/img/facebook.svg";
import Gitlab from "static/img/gitlab.svg";
import Youtube from "static/img/youtube.svg";
import Tiktok from "static/img/tiktok.svg";
import Instagram from "static/img/instagram.svg";
import Telegram from "static/img/telegram.svg";

export const Footer = () => {
  return useObserver(() => (
    <div className={styles.container}>
      <div className={styles.bg}>
        <img src={Bg} alt="background" />
      </div>

      {/*-------- Main Container information --------*/}

      <div className={styles.mainContainer}>
        <section className={styles.section}>
          <h3>Company</h3>
          <ul>
            <li>
              <a target="_blank" href="https://www.zenotta.xyz/en/home.html#about">About Us</a>
            </li>
            <li>
              <a target="_blank" href="https://www.zenotta.xyz/en/team.html">Team</a>
            </li>
            <li>
              <a target="_blank" href="https://www.zenotta.xyz/en/privacy-policy.html">
                Privacy Policy
              </a>
            </li>
            <li>
              <a target="_blank" href="https://www.zenotta.xyz/en/zenotta-imprint.html">
                Imprint
              </a>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h3>Service</h3>
          <ul>
            <li>
              <a target="_blank" href="https://www.zenotta.xyz/en/videos.html">Videos</a>
            </li>
            <li>
              <a target="_blank" href="https://www.zenotta.xyz/en/faqs.html">FAQ</a>
            </li>
            <li>
              <a target="_blank" href="https://www.zenotta.xyz/en/events.html">Events</a>
            </li>
            <li>
              <a target="_blank" href="https://www.zenotta.xyz/en/pressroom.html">Pressroom</a>
            </li>
            <li>
              <a target="_blank" href="https://www.zenotta.xyz/en/news-press-releases.html">
                Press Releases
              </a>
            </li>
            <li>
              <a target="_blank" href="mailto:pr@zenotta.com">Media &amp; PR</a>
            </li>
          </ul>
        </section>

        <section className="section">
          <h3>Community</h3>
          <ul>
            <li>
              <a target="_blank" href="https://www.zenotta.io">For Developers</a>
            </li>
            <li>
              <a target="_blank" href="https://gitlab.com/zenotta">GitLab</a>
            </li>
            <li>
              <a target="_blank" href="https://docs.zenotta.xyz/lightbook/">
                The Zenotta Lightbook
              </a>
            </li>
            <li>
              <a target="_blank" href="https://zenotta.io/research/philosophy/peer-to-peer-electronic-trade">
                The Zenotta White Paper
              </a>
            </li>
          </ul>
        </section>

        <section className="section">
          <h3>Settings</h3>
          <ul>
            <li>
              <a target="_blank" href="https://www.zenotta.xyz/en/privacy-settings.html">
                Privacy Settings
              </a>
            </li>
            <li>
              <a target="_blank" href="https://www.zenotta.xyz/en/newsletter-subscription-management.html">
                Manage Newsletter Subscription
              </a>
            </li>
          </ul>
        </section>
      </div>

      {/*-------- Social Media --------*/}

      <div className={styles.socialMedia}>
        <p>Copyright 2022 &copy; Zenotta AG</p>

        <ul>
          <li>
            <a target="_blank" href="https://www.linkedin.com/company/zenotta">
              <img src={LinkedIn} alt="LinkedIn" />
            </a>
          </li>
          <li>
            <a target="_blank" href="https://twitter.com/zenotta_ag">
              <img src={Twitter} alt="Twitter" />
            </a>
          </li>
          <li>
            <a target="_blank" href="https://www.facebook.com/zenotta.xyz">
              <img src={Facebook} alt="Facebook" />
            </a>
          </li>
          <li>
            <a target="_blank" href="https://www.instagram.com/zenotta/">
              <img src={Instagram} alt="Instagram" />
            </a>
          </li>
          <li>
            <a target="_blank" href="https://www.tiktok.com/@zenotta">
              <img src={Tiktok} alt="TikTok" />
            </a>
          </li>
          <li>
            <a target="_blank" href="https://www.youtube.com/channel/UCKmU1l9mRrnGC0IQFlixUDw">
              <img src={Youtube} alt="YouTube" />
            </a>
          </li>
          <li>
            <a target="_blank" href="https://gitlab.com/zenotta">
              <img src={Gitlab} alt="GitLab" />
            </a>
          </li>
          <li>
            <a target="_blank" href="https://t.me/zenotta">
              <img src={Telegram} alt="Telegram" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  ));
};
