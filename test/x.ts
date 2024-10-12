import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("X", function () {
  async function deployContract() {
    // const [owner, otherAccount] = await hre.ethers.getSigners();
    const Contract = await hre.ethers.getContractFactory("X");
    const contract = await Contract.deploy()
    
    return contract
  }
  
  describe("Deployment", function () {
    it("Any address should have 0 posts at deployment", async function () {
      const contract = await deployContract()
      const [account] = await hre.ethers.getSigners()
      const posts = await contract.get_all_posts(account)

      expect(posts.length).to.be.equal(0);
    });
  });

  describe("Posts", function () {
    it("Create and get a post", async()=>{
      const contract = await loadFixture(deployContract)
      const [account] = await hre.ethers.getSigners()
      contract.connect(account)
      
      const post_to_test = "This is Chanchito Feliz reporting from my first post yeahhh!!!!"
      
      await contract.create_post(post_to_test)
      const post = await contract.get_post(account, 0)

      expect(post.content).to.be.equal(post_to_test)
      expect(post.autor).to.be.equal(account)
      expect(post.likes).to.be.equal(0)
    })

    it("Get all posts", async()=>{
      const contract = await loadFixture(deployContract)
      const [account] = await hre.ethers.getSigners()
      contract.connect(account)

      const post_to_test = "This is Chanchito Feliz reporting from my first post yeahhh!!!!"
      await contract.create_post(post_to_test)
      
      const posts = await contract.get_all_posts(account)

      expect(posts.length).to.be.equal(1)
    })
  });

});
