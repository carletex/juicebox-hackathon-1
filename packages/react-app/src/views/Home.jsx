import { useContractReader } from "eth-hooks";
import React, { useEffect, useState } from "react";
import { Button, List, Card } from "antd";
import { Address } from "../components";
import { ipfs } from "../helpers";
import { useJuiceBoxBalance } from "../hooks";

const { ethers } = require("ethers");

function Home({ DEBUG, readContracts, writeContracts, tx, mainnetProvider, blockExplorer, config }) {
  const totalSupply = useContractReader(readContracts, "JBNFT", "totalSupply");
  if (DEBUG) console.log("🤗 totalSupply:", totalSupply);

  const { data: balance } = useJuiceBoxBalance({ provider: mainnetProvider, projectId: config.juiceBoxProjectId });
  const balanceETH = balance ? parseFloat(ethers.utils.formatEther(balance)).toFixed(4) : "...";

  const [nfts, setNfts] = useState();
  const [loading, setLoading] = useState(false);
  const [levels, setLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 9;

  useEffect(() => {
    const updateNfts = async () => {
      if (readContracts.JBNFT && totalSupply) {
        setLoading(true);
        const collectibleUpdate = [];
        for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
          if (DEBUG) console.log("Getting NFT tokenId: ", tokenId);
          const tokenURI = await readContracts.JBNFT.tokenURI(tokenId);
          if (DEBUG) console.log("tokenURI: ", tokenURI);
          const owner = await readContracts.JBNFT.ownerOf(tokenId);
          if (DEBUG) console.log("owner: ", owner);

          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
          console.log("ipfsHash", ipfsHash);

          const jsonManifestBuffer = await ipfs.getFromIPFS(ipfsHash);

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            collectibleUpdate.push({ id: tokenId, owner: owner, uri: tokenURI, ...jsonManifest });
          } catch (e) {
            console.log(e);
          }
        }
        setNfts(collectibleUpdate);
        setLoading(false);
      }
    };
    updateNfts();
    // eslint-disable-next-line
  }, [DEBUG, readContracts.JBNFT, (totalSupply || "0").toString()]);

  useEffect(() => {
    const updateLevels = async () => {
      if (readContracts.JBNFT) {
        setLoadingLevels(true);
        const levelIdCounter = await readContracts.JBNFT.levelIdCounter();
        if (DEBUG) console.log("levelIdCounter:", levelIdCounter);

        if (levelIdCounter > 0) {
          const levelUpdate = [];
          for (let levelId = 0; levelId < levelIdCounter; levelId++) {
            const levelData = await readContracts.JBNFT.levels(levelId);
            const jsonManifestBuffer = await ipfs.getFromIPFS(levelData[1]);
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            levelUpdate.push({ id: levelId, price: levelData[0], image: jsonManifest.image });
          }
          if (DEBUG) console.log("Levels: ", levelUpdate);
          setLevels(levelUpdate);
        }
        setLoadingLevels(false);
      }
    };
    updateLevels();
    // eslint-disable-next-line
  }, [DEBUG, readContracts.JBNFT]);

  return (
    <div>
      <div style={{ margin: "auto", padding: 32, paddingBottom: 0 }}>
        <div style={{ marginTop: 50 }}>
          <div style={{ fontSize: 24 }}>
            <p>Mint an NFT and support our project on JuiceBox.</p>
            <p>In Treasury: Ξ{balanceETH}</p>
          </div>

          <div>
            <List
              grid={{
                xs: 1,
                sm: 2,
                md: 2,
                lg: 3,
                xl: 3,
                xxl: 3,
              }}
              pagination={false}
              loading={loadingLevels}
              dataSource={levels}
              renderItem={level => {

                return (
                  <List.Item key={level.id}>
                    <Card
                      style={{ border: "none" }}
                      headStyle={{ borderBottom: "none" }}
                      title={
                        <div>
                          <Button
                            style={{
                              width: 380,
                              fontSize: 20,
                              height: 50,
                              backgroundColor: "#60f479",
                              borderColor: "#60f479",
                              color: "black",
                              fontWeight: "bold",
                            }}
                            type="primary"
                            onClick={async () => {
                              try {
                                console.log("price: ", level.price);
                                const txCur = await tx(
                                  writeContracts.JBNFT.mintItem(level.id, {
                                    value: level.price,
                                  }),
                                );
                                await txCur.wait();
                              } catch (e) {
                                console.log("mint failed", e);
                              }
                            }}
                          >
                            MINT for Ξ{ethers.utils.formatEther(level.price)}
                          </Button>
                        </div>
                      }
                    >
                      <img src={level.image} alt={"Level #" + level.id} width="380" height="300" />
                    </Card>
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ width: "auto", margin: "auto", padding: 25, minHeight: 800 }}>
        <div>
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 2,
              lg: 3,
              xl: 3,
              xxl: 3,
            }}
            pagination={{
              total: totalSupply,
              defaultPageSize: perPage,
              defaultCurrent: page,
              onChange: currentPage => {
                setPage(currentPage);
              },
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${totalSupply} items`,
            }}
            loading={loading}
            dataSource={nfts}
            renderItem={item => {
              const id = item.id;

              return (
                <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                  <Card
                    style={{ backgroundColor: "#b3e2f4", border: "1px solid #0071bb", borderRadius: 10 }}
                    title={
                      <div>
                        <span style={{ fontSize: 18, marginRight: 8, fontWeight: "bold" }}>{item.id}</span>
                      </div>
                    }
                  >
                    <img src={item.image} alt={"NFT #" + id} width="380" height="300" />
                    <div>
                      <Address
                        address={item.owner}
                        ensProvider={mainnetProvider}
                        blockExplorer={blockExplorer}
                        fontSize={16}
                      />
                    </div>
                  </Card>
                </List.Item>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
