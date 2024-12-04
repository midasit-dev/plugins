import { GuideBox, Grid, Panel } from "@midasit-dev/moaui";

const Footer = () => {
  return (
    <Grid container position={"relative"} width={"100%"} padding={2}>
      <Panel height="fit-content" variant="shadow" width="100%">
        {/* {Footer Components} */}
        Footer
      </Panel>
    </Grid>
  );
};

const FooterStyle: any = {
  position: "absolute",
  width: "100%",
  // height: "100%",
  backgroundColor: "#333",
  color: "#fff",
  padding: "10px",
};

export default Footer;
