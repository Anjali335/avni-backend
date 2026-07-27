import Policy from '../models/Policy.js';

const defaultPolicies = {
  privacy: {
    title: 'Privacy Policy',
    content: `At Avni’s Cars Collections, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Avni’s Cars Collections and how we use it.

If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.

### Log Files
Avni’s Cars Collections follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.

### Consent
By using our website, you hereby consent to our Privacy Policy and agree to its terms.`,
  },
  terms: {
    title: 'Terms & Conditions',
    content: `Welcome to Avni’s Cars Collections!

These terms and conditions outline the rules and regulations for the use of Avni’s Cars Collections's Website.

By accessing this website we assume you accept these terms and conditions. Do not continue to use Avni’s Cars Collections if you do not agree to take all of the terms and conditions stated on this page.

### License
Unless otherwise stated, Avni’s Cars Collections and/or its licensors own the intellectual property rights for all material on Avni’s Cars Collections. All intellectual property rights are reserved. You may access this from Avni’s Cars Collections for your own personal use subjected to restrictions set in these terms and conditions.

You must not:
* Republish material from Avni’s Cars Collections
* Sell, rent or sub-license material from Avni’s Cars Collections
* Reproduce, duplicate or copy material from Avni’s Cars Collections
* Redistribute content from Avni’s Cars Collections

### Disclaimer
To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website.`,
  },
  refund: {
    title: 'Refund Policy',
    content: `Our Refund Policy details the terms and conditions for bookings, token payments, and cancellations at Avni’s Cars Collections.

### Booking & Token Amount
When you place a booking or token deposit on a vehicle, we mark that vehicle as 'Reserved' and take it off the active marketplace to allow you to complete the purchase details.

### Cancellation & Refund Rules
* **Cancellation within 48 Hours**: If you choose to cancel your booking within 48 hours of placing the deposit, you are eligible for a 100% full refund of the token amount.
* **Cancellation after 48 Hours**: Cancellations made after 48 hours are subject to a nominal processing fee or management discretion depending on how long the vehicle was held off the market.
* **Failed Financing**: If your vehicle purchase cannot be completed due to loan rejection by our partner banks, the booking token amount will be refunded in full.

### Process for Refunds
To request a refund, please contact your sales executive or write to us at support@avnicarscollections.com with your booking receipt details. Approved refunds are processed back to the original payment source within 5-7 business days.`,
  }
};

// @desc    Get policy by type
// @route   GET /api/policies/:type
// @access  Public
export const getPolicy = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['privacy', 'terms', 'refund'].includes(type)) {
      return res.status(404).json({ message: 'Invalid policy type' });
    }

    let policy = await Policy.findOne({ where: { type } });
    
    if (!policy) {
      // Return default boilerplate if not yet edited in DB
      return res.json({
        type,
        title: defaultPolicies[type].title,
        content: defaultPolicies[type].content,
        isDefault: true
      });
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update or create policy
// @route   PUT /api/policies/:type
// @access  Private/Admin
export const updatePolicy = async (req, res) => {
  try {
    const { type } = req.params;
    const { title, content } = req.body;

    if (!['privacy', 'terms', 'refund'].includes(type)) {
      return res.status(404).json({ message: 'Invalid policy type' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    let policy = await Policy.findOne({ where: { type } });

    if (policy) {
      await policy.update({ title, content });
    } else {
      policy = await Policy.create({ type, title, content });
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
