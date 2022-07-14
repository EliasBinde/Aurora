import Stripe from "stripe";

export const stripe = new Stripe(
  "sk_test_51LIvs1BrL3wc97imXPsiKUc20uwhQktnfhla9CztTA8gvO06tZY5d3Gid608vI2t2JMD9FGTUEmyXg2N6TXFQVXb00l8TcD5s4",
  {
    apiVersion: "2020-08-27",
  }
);
