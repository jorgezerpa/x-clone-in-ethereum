import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("X", function () {
  async function deployContract() {
    const Contract = await hre.ethers.getContractFactory("X");
    const contract = await Contract.deploy()
    
    return contract
  }
  
  describe("Deployment", function () {
    it("Any address should have 0 posts at deployment", async function () {
      const contract = await deployContract()
      const [_, account] = await hre.ethers.getSigners()
      const posts = await contract.get_all_posts(account)

      expect(posts.length).to.be.equal(0);
    });
  });

  describe("Posts", function () {
    it("Create and get a post", async()=>{
      const contract = await loadFixture(deployContract)
      const [_, account] = await hre.ethers.getSigners()
      
      const post_to_test = "This is Chanchito Feliz reporting from my first post yeahhh!!!!"
      
      await contract.connect(account).create_post(post_to_test)
      const post = await contract.connect(account).get_post(account, 0)

      expect(post.content).to.be.equal(post_to_test)
      expect(post.autor).to.be.equal(account)
      expect(post.likes).to.be.equal(0)
    })

    it("Get all posts", async()=>{
      const contract = await loadFixture(deployContract)
      const [_,account] = await hre.ethers.getSigners()

      const post_to_test = "This is Chanchito Feliz reporting from my first post yeahhh!!!!"
      await contract.connect(account).create_post(post_to_test)
      
      const posts = await contract.connect(account).get_all_posts(account)

      expect(posts.length).to.be.equal(1)
    })
  });
  
  describe("Censored accounts", function () {
    
    it("Should fail if account is censored", async()=>{
      const contract = await loadFixture(deployContract)
      const [owner, accountToCensure, accountToCensure2] = await hre.ethers.getSigners()

      await contract.add_censored_account(accountToCensure)
      await contract.add_censored_account(accountToCensure2)
      
      const postsOfNotCensuredUser = await contract.get_all_posts(owner)
      expect(postsOfNotCensuredUser.length===0, "Should be able to interact with contract if the caller is not censured")
      
      await expect(contract.connect(accountToCensure).get_all_posts(accountToCensure), `Account ${accountToCensure.address} is censured. Should revert`).to.be.revertedWith('This account is censored')
      await expect(contract.connect(accountToCensure).get_all_posts(accountToCensure), `Account ${accountToCensure2.address} is censured. Should revert`).to.be.revertedWith('This account is censored')
    })
    
    it("Should remove censored accounts", async()=>{
      const contract = await loadFixture(deployContract)
      const [_, accountToCensure] = await hre.ethers.getSigners()
      
      await contract.add_censored_account(accountToCensure)
      await expect(contract.connect(accountToCensure).get_all_posts(accountToCensure), `Account ${accountToCensure.address} is censured. Should revert`).to.be.revertedWith('This account is censored')
      await contract.remove_censored_account(accountToCensure)
      const postsAfterRemoveCensures = await contract.connect(accountToCensure).get_all_posts(accountToCensure)
      expect(postsAfterRemoveCensures.length===0, "Should be able to interact with contract if the owner removes the censure")
    })

  });

  describe("likes", ()=>{
    it("should like adn dislike", async()=>{
      const contract = await loadFixture(deployContract)
      const [_, account] = await hre.ethers.getSigners()
      
      const post_to_test = "This is Chanchito Feliz reporting from my first post yeahhh!!!!"
      
      await contract.connect(account).create_post(post_to_test)
      const post = await contract.connect(account).get_post(account, 0)
      expect(Number(post.likes)==0, "number of likes should be 0 initially")
      await contract.like_post(account, 0)
      expect(Number(post.likes)==1, "post should received a like")
      await contract.unlike_post(account, 0)
      expect(Number(post.likes)==0, "post likes should be subtracted")
    })
  })
  
  describe("events", ()=>{
    it("should emit newPostCreated event", async()=>{
      const contract = await loadFixture(deployContract)
      const [sender] = await hre.ethers.getSigners()
      const post = "This is the post"
      await expect(contract.create_post(post))
        .to
        .emit(contract, "newPostCreated")
        .withArgs(sender, post)
    })
    it("should emit postLiked event", async()=>{
      const contract = await loadFixture(deployContract)
      const [autor, liker] = await hre.ethers.getSigners()
      const post = "This is the post"
      await contract.connect(autor).create_post(post)
      await expect(contract.connect(liker).like_post(autor, 0))
      .to
      .emit(contract, "postLiked")
      .withArgs(liker, 0)
    })
  })

});
