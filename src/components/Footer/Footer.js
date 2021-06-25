/* eslint import/no-webpack-loader-syntax : 0 */
import FooterFr from '!babel-loader!mdx-loader!../../contents/fr/footer.mdx';
import FooterEn from '!babel-loader!mdx-loader!../../contents/fr/footer.mdx';

const Footer = ({lang}) => {
  return (
    <footer className="Footer">
      <div className="footer-contents">
      {lang === 'fr' ? <FooterFr /> : <FooterEn />}
      </div>
    </footer>
  )
}

export default Footer;